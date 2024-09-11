import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { formatDate, parseJwt } from '../../utils/tokenUtils';

const isToday = (dateStr) => {
  const today = new Date();
  const date = new Date(dateStr);
  return today.toDateString() === date.toDateString();
};

const isFuture = (dateStr) => {
  const today = new Date();
  const date = new Date(dateStr);
  return date > today;
};

const isWithinPeriod = (startStr, endStr) => {
  const today = new Date();
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  return today >= startDate && today <= endDate;
};

const UserAudits = () => {
  const [audits, setAudits] = useState([]);
  const [error, setError] = useState('');
  const route = useRoute();
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);

  // Fetch User ID from token stored in AsyncStorage
  const getUserIdFromToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.userId) {
          return decodedToken.userId;
        }
      }
    } catch (error) {
      console.error('Error fetching userId from token:', error);
    }
    return null;
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const idFromParams = route.params?.userId;
      if (idFromParams) {
        setUserId(idFromParams);
      } else {
        const idFromToken = await getUserIdFromToken();
        if (idFromToken) {
          setUserId(idFromToken);
        } else {
          setError('User ID is missing');
        }
      }
    };

    const fetchAudits = async () => {
      try {
        if (!userId) return;
        const token = await AsyncStorage.getItem('authToken');
        const response = await fetch(`http://192.168.8.106:8080/Audit/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        const filteredAudits = data.filter(audit => 
          isToday(audit.dateFin) || isWithinPeriod(audit.dateDebut, audit.dateFin) || isFuture(audit.dateFin)
        );
        const sortedAudits = filteredAudits.sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut));
        setAudits(sortedAudits);
      } catch (error) {
        setError('Error fetching audits: ' + error.message);
      }
    };

    fetchUserId().then(fetchAudits);
  }, [userId, route.params]);

  const handleAuditClick = (auditId, isAccessible) => {
    if (isAccessible) {
      navigation.navigate('Reponse', { auditId });
    }
  };

  if (!userId || error) {
    return (
      <View style={styles.container}>
        <Text>{error || 'Error: User ID is missing'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Audits à faire</Text>
      {audits.length > 0 ? (
        audits.map((audit) => {
          const isTodayAudit = isToday(audit.dateFin);
          const isAccessible = !isFuture(audit.dateFin) || isTodayAudit || isWithinPeriod(audit.dateDebut, audit.dateFin);

          return (
            <TouchableOpacity
              key={audit.id}
              style={[styles.auditCard, isTodayAudit && styles.todayAudit, !isAccessible && styles.disabledCard]}
              onPress={() => handleAuditClick(audit.id, isAccessible)}
              disabled={!isAccessible}
            >
              <Text style={styles.auditText}>Le nom du Formulaire: {audit.formulaire.nom}</Text>
              <Text style={styles.auditText}>Ville d'escale: {audit.escaleVille}</Text>
              <Text style={styles.auditText}>Date de début: {formatDate(audit.dateDebut)}</Text>
              <Text style={styles.auditText}>Date de fin: {formatDate(audit.dateFin)}</Text>
            </TouchableOpacity>
          );
        })
      ) : (
        <Text>No audits à faire.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  auditCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  todayAudit: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  disabledCard: {
    opacity: 0.5,
  },
  auditText: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default UserAudits;

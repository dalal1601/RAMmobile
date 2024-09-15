import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

const PersonnesRencontreesTable = ({ auditId, onSave }) => {
  const [rows, setRows] = useState([
    { id: Date.now(), fullName: '', title: '', isSaved: false }
  ]);
  const [initialRowCount, setInitialRowCount] = useState(0);

  useEffect(() => {
    loadExistingPersonnesRencontrees();
  }, []);

  const loadExistingPersonnesRencontrees = async () => {
    try {
      const response = await fetch(`http://172.20.10.3:8080/Audit/${auditId}/personnes-rencontrees`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const loadedRows = data.map(p => ({
            id: p.id,
            fullName: p.fullname,
            title: p.title,
            isSaved: true
          }));
          setRows(loadedRows);
          setInitialRowCount(loadedRows.length);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des personnes rencontrées:', error);
    }
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now(), fullName: '', title: '', isSaved: false }]);
  };

  const removeRow = () => {
    if (rows.length > initialRowCount) {
      setRows(rows.slice(0, -1));
    }
  };

  const handleChange = (id, field, value) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSave = async () => {
    const newRows = rows.filter(row => !row.isSaved && row.fullName && row.title);
    if (newRows.length === 0) return;

    try {
      const response = await fetch(`http://172.20.10.3:8080/Audit/${auditId}/personnes-rencontrees`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRows.map(row => ({
          fullname: row.fullName,
          title: row.title
        }))),
      });

      if (response.ok) {
        const updatedRows = rows.map(row => 
          newRows.find(newRow => newRow.id === row.id) 
            ? { ...row, isSaved: true }
            : row
        );
        setRows(updatedRows);
        onSave();
      }
    } catch (error) {
     console.log(error)
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Les personnes rencontrées</Text>
        <View style={styles.iconContainer}>
          <IconButton 
            icon="minus" 
            onPress={removeRow} 
            disabled={rows.length <= initialRowCount}
            style={[styles.iconButton, rows.length <= initialRowCount && styles.disabledButton]}
          />
          <IconButton 
            icon="plus" 
            onPress={addRow}
            style={styles.iconButton}
          />
        </View>
      </View>
      <ScrollView style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Full Name</Text>
          <Text style={styles.headerCell}>Title</Text>
        </View>
        {rows.map((row, index) => (
          <View key={row.id} style={styles.row}>
            <TextInput
              style={[styles.input, row.isSaved && styles.savedInput]}
              value={row.fullName}
              onChangeText={(text) => handleChange(row.id, 'fullName', text)}
              editable={!row.isSaved}
            />
            <TextInput
              style={[styles.input, row.isSaved && styles.savedInput]}
              value={row.title}
              onChangeText={(text) => handleChange(row.id, 'title', text)}
              editable={!row.isSaved}
            />
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
  <Text style={styles.saveButtonText}>Enregistrer</Text>
</TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop:50
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  tableContainer: {
    
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRightColor: '#ddd', 
    borderRightWidth: 2,  
    borderBottomWidth: 2,
    padding:20,
    borderBottomColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
   
  },
  input: {
    flex: 1,
    padding: 10,
    color: '#333',
    borderRightWidth: 2,  
    borderRightColor: '#ddd', 
  },
  savedInput: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#C2002F',
    padding: 10,
    alignItems: 'center',
    marginTop: 50,
    borderRadius:20
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    padding:10,
    borderRadius:2
  },
});

export default PersonnesRencontreesTable;
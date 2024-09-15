import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator, Modal, TextInput, Alert, StyleSheet, FlatList, ScrollView ,TouchableOpacity,Platform } from 'react-native';
import { DataTable, Snackbar, Appbar, Dialog, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import AuditChecklistTable from './AuditChecklistTable';
import { Appearance } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import PersonnesRencontreesTable from './PersonnesRencontreesTable';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { IconButton, Button, Checkbox, } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const StyledTableCell = ({ children }) => (
    <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>{children}</Text>
    </View>
);

const StyledDialog = ({ visible, onClose, title, children }) => (
    <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
    >
        <View style={styles.dialogContainer}>
            <View style={styles.dialogContent}>
                <Text style={styles.dialogTitle}>{title}</Text>
                <View style={styles.dialogBody}>{children}</View>
                <View style={styles.dialogActions}>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.dialogButton}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

const SectionRow = ({ children }) => (
    <View style={styles.sectionRow}>
        {children}
    </View>
);


const InitialPopup = ({ open, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const route = useRoute();
    const auditId = route.params?.auditId;
    


    const handleSubmit = async () => {
        if (name && email) {
            setLoading(true);
            setError(null);
            try {
                const id = await AsyncStorage.getItem('id'); // Get ID from AsyncStorage
                const response = await fetch(`http://172.20.10.3:8080/User/addAudit?auditId=${encodeURIComponent(auditId)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fullname: name, email: email, phone, date }),
                });

                if (!response.ok) {
                    throw new Error('Failed to create user');
                }

                const userData = await response.json();
                onClose({ name, email, id: userData.id });
            } catch (error) {
                setError('Failed to submit data');
                console.log(error);
            } finally {
                setLoading(false);
            }
        } else {
            setError('Please fill out all required fields');
        }
    };

    /*return (
        <Modal
            transparent={true}
            visible={open}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Veuillez entrer les informations d'audité</Text>
                    <ScrollView style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom complet"
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Emploi"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Numéro de téléphone"
                            keyboardType="numeric"
                            value={phone}
                            onChangeText={setPhone}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Observation sur place Date"
                            value={date}
                            onChangeText={setDate}
                        />
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            disabled={loading}
                            style={styles.button}
                        >
                            {loading ? "Envoi en cours..." : "Continuer"}
                        </Button>
                        {error && <Text style={styles.errorText}>{error}</Text>}
                    </ScrollView>
                    <Button
                        mode="outlined"
                        onPress={onClose}
                        style={styles.button}
                    >
                        Close
                    </Button>
                </View>
            </View>
        </Modal>
    );*/
};

const ConfirmationDialog = ({ open, onClose, onConfirm, formulaire, checkedItems, existingReponses = {} }) => {
    const theme = useTheme();

    const getReponseStatus = (regleId) => {
        const response = checkedItems[regleId] || existingReponses[regleId];
        return response?.value || 'NON_CONFORME';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFORME': return theme.colors.success;
            case 'NON_CONFORME': return theme.colors.error;
            case 'OBSERVATION': return theme.colors.info;
            case 'AMELIORATION': return theme.colors.warning;
            default: return theme.colors.text;
        }
    };

    return (
        <Modal
            transparent={true}
            visible={open}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Confirmation des réponses</Text>
                    <ScrollView style={styles.tableContainer}>
                        {formulaire.sectionList.map((section, sectionIndex) => (
                            <View key={sectionIndex} style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>{section.description}</Text>
                                {section.regles.map((regle, regleIndex) => {
                                    const reponseStatus = getReponseStatus(regle.id);
                                    const reponse = checkedItems[regle.id] || existingReponses[regle.id] || {};
                                    return (
                                        <View key={`${sectionIndex}-${regleIndex}`} style={styles.row}>
                                            <Text style={styles.cell}>{regle.description}</Text>
                                            <Text style={[styles.cell, { color: getStatusColor(reponseStatus) }]}>
                                                {reponseStatus}
                                            </Text>
                                            <Text style={styles.cell}>{reponse.commentaire || ''}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                        <Button
                            mode="text"
                            onPress={onClose}
                            color={theme.colors.primary}
                        >
                            Annuler
                        </Button>
                        <Button
                            mode="contained"
                            onPress={onConfirm}
                            color={theme.colors.primary}
                        >
                            Confirmer
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const Reponse = () => {

    const theme = useTheme();
    const isDarkMode = Appearance.getColorScheme() === 'dark';

    const [audit, setAudit] = useState(null);
    const [formulaire, setFormulaire] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [checkedItems, setCheckedItems] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [userId, setUserId] = useState(null);
    const [fullname, setFullname] = useState(null);
    const [isEditable, setIsEditable] = useState(true);
    const [reponseId, setReponseId] = useState(null);
    const [existingReponses, setExistingReponses] = useState({});
    const [isGeneralitiesSent, setIsGeneralitiesSent] = useState(false);
    const [summaryOfAirlinesAssisted, setSummaryOfAirlinesAssisted] = useState('');
    const [numberOfFlightsHandled, setNumberOfFlightsHandled] = useState('');
    const [numberOfCheckInAgents, setNumberOfCheckInAgents] = useState('');
    const [numberOfRampAgents, setNumberOfRampAgents] = useState('');
    const [numberOfSupervisors, setNumberOfSupervisors] = useState('');
    const [numberOfGSEMaintenance, setNumberOfGSEMaintenance] = useState('');
    const [initialRowCount, setInitialRowCount] = useState(0);
    const [observationsurplacedate, setObservationsurplacedate] = useState('');
    const [isAuditeRegistered, setIsAuditeRegistered] = useState(false);
    const [Fullnamo, setFullnamo] = useState('');
 
    const route = useRoute();
    const [showDatePicker, setShowDatePicker] = useState(false);


    const [auditeInfo, setAuditeInfo] = useState({
        email: '', // Ajoutez cette ligne si ce n'était pas déjà le cas

        emploi: '',
        phonenumber: '',
      });




      const isAllFieldsFilled = useMemo(() => {
        return summaryOfAirlinesAssisted !== '' &&
               numberOfFlightsHandled !== '' &&
               numberOfCheckInAgents !== '' &&
               numberOfRampAgents !== '' &&
               numberOfSupervisors !== '' &&
               numberOfGSEMaintenance !== '';
      }, [summaryOfAirlinesAssisted, numberOfFlightsHandled, numberOfCheckInAgents, numberOfRampAgents, numberOfSupervisors, numberOfGSEMaintenance]);
        

      const loadExistingGeneralities = async () => {
        try {
          const response = await fetch(`http://172.20.10.3:8080/Audit/${auditId}/generalities`);
          if (response.ok) {
            const data = await response.json();
            setSummaryOfAirlinesAssisted(data.generalities.summaryofairlinesassisted || '');
            setNumberOfFlightsHandled(data.generalities.numberofflightshandledperdayinmonth?.toString() || '');
            setNumberOfCheckInAgents(data.generalities.numberofcheckinandboardingagents?.toString() || '');
            setNumberOfRampAgents(data.generalities.numberoframpagents?.toString() || '');
            setNumberOfSupervisors(data.generalities.numberofsupervisors?.toString() || '');
            setNumberOfGSEMaintenance(data.generalities.numberofgsemaintenance?.toString() || '');
            setIsGeneralitiesSent(data.isGeneralitiesSent);
          } else {
            throw new Error('Failed to load generalities');
          }
        } catch (error) {
          
        }
      };
    

      
    const [open, setOpen] = useState(false);

    const [items, setItems] = useState([
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
    ]);
    const handleSaveGeneralities = async () => {
        setIsSubmitting(true);
        try {
          const response = await fetch(`http://172.20.10.3:8080/Audit/${auditId}/generalities`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              summaryofairlinesassisted: summaryOfAirlinesAssisted,
              numberofflightshandledperdayinmonth: numberOfFlightsHandled,
              numberofcheckinandboardingagents: numberOfCheckInAgents,
              numberoframpagents: numberOfRampAgents,
              numberofsupervisors: numberOfSupervisors,
              numberofgsemaintenance: numberOfGSEMaintenance,
            }),
          });
    
          if (!response.ok) {
            throw new Error('Failed to save generalities');
          }
    
          Alert.alert('Success', 'Généralités sauvegardées avec succès!');
        } catch (error) {
          Alert.alert('Error', `Erreur: ${error.message}`);
        } finally {
          setIsSubmitting(false);
        }
      };
    
      const handleSendGeneralities = async () => {
        setIsSubmitting(true);
        try {
          const response = await fetch(`http://172.20.10.3:8080/Audit/${auditId}/send-generalities`, {
            method: 'PUT',
          });
    
          if (!response.ok) {
            throw new Error('Failed to send generalities');
          }
    
          const updatedAudit = await response.json();
          setIsGeneralitiesSent(updatedAudit.generalitiesSent);
          Alert.alert('Success', 'Généralités envoyées avec succès!');
        } catch (error) {
          Alert.alert('Error', `Erreur: ${error.message}`);
        } finally {
          setIsSubmitting(false);
        }
      };

      
    
      const handleSave = async () => {
        setIsSubmitting(true);
      
        const invalidRules = Object.entries(checkedItems).filter(([_, value]) =>
          value.value !== 'CONFORME' && !value.commentaire.trim()
        );
      
        if (invalidRules.length > 0) {
          Alert.alert(
            'Commentaires manquants',
            'Veuillez ajouter un commentaire pour toutes les règles non conformes, avec observation ou amélioration.',
            [{ text: 'OK' }]
          );
          setIsSubmitting(false);
          return;
        }
      
        const reponses = Object.entries(checkedItems).map(([regleId, value]) => ({
          [regleId]: {
            value: value.value,
            commentaire: value.commentaire.trim(),
            nonConformeLevel: value.value === 'NON_CONFORME' ? value.nonConformeLevel : undefined
          }
        }));
      
        const payload = {
          audit: { id: auditId },
          reponses: reponses,
          temporary: true
        };
      
        try {
          const response = await fetch('http://172.20.10.3:8080/Reponse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
      
          if (!response.ok) {
            throw new Error('Failed to save data');
          }
      
          const result = await response.json();
          setReponseId(result.id);
          Alert.alert('Succès', 'Données enregistrées avec succès!');
      
          setExistingReponses(prev => ({
            ...prev,
            ...Object.fromEntries(reponses.map(r => [Object.keys(r)[0], Object.values(r)[0]]))
          }));
      
        } catch (error) {
          Alert.alert('Erreur', `Erreur: ${error.message}`);
        } finally {
          setIsSubmitting(false);
        }
      };
    const [rows, setRows] = useState([
        { fullName: '', title: '', isSaved: false },
    ]);

    const addRow = () => {
        setRows([...rows, { id: Date.now(), fullName: '', title: '', isSaved: false }]);
      };

      const handleChange = (id, field, value) => {
        setRows(rows.map(row => 
          row.id === id ? { ...row, [field]: value } : row
        ));
      };



      const handleSend = async () => {
        setOpenConfirmDialog(true);
      };



    const loadExistingReponses = async () => {
         
        try {
            const response = await fetch(`http://172.20.10.3:8080/Reponse/audit/${auditId}`);
            if (!response.ok) {
                throw new Error('Failed to load existing responses');
            }
            const data = await response.json();
            if (data && data.reponses) {
                const reponses = data.reponses.reduce((acc, reponse) => {
                    acc[reponse.regle.id] = {
                        value: reponse.value,
                        commentaire: reponse.commentaire,
                        nonConformeLevel: reponse.nonConformeLevel
                    };
                    return acc;
                }, {});
                setExistingReponses(reponses);
                setCheckedItems(reponses);
                setReponseId(data.id);
                setIsEditable(data.temporary);
            }
        } catch (error) {
         }
    };
    const { auditId } = route.params;

    const fetchAuditAndFormulaire = async () => {
        try {
            setLoading(true);
            setError(null);
            setAudit(null);
            setFormulaire(null);

            // Fetch Audit Data
            const auditResponse = await fetch(`http://172.20.10.3:8080/Audit/${auditId}`);
            if (!auditResponse.ok) {
                throw new Error(`Failed to fetch audit: ${auditResponse.statusText}`);
            }
            const auditData = await auditResponse.json();
            console.log("-.-.-.- data:", auditData);
            console.log("-.-.-.- audit:", auditData.audite);
            setFullname(auditData.auditeur.fullname);
            setAudit(auditData);

            // Fetch Formulaire Data
            const formulaireId = auditData.formulaire.id;
            const formulaireResponse = await fetch(`http://172.20.10.3:8080/Formulaire/${formulaireId}`);
            if (!formulaireResponse.ok) {
                throw new Error(`Failed to fetch formulaire: ${formulaireResponse.statusText}`);
            }
            const formulaireData = await formulaireResponse.json();
            setFormulaire(formulaireData);

            console.log('Formulaire chargé:', formulaireData);
        } catch (error) {
            setError(`Une erreur est survenue lors du chargement des détails. ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


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



    useEffect(() => {
        fetchAuditAndFormulaire();
        loadExistingReponses();
        loadExistingGeneralities();
        loadExistingPersonnesRencontrees();

    }, [auditId]);
   
   
    const handleCheckboxChange = (regleId, value) => {
        if (isEditable) {
            setCheckedItems(prev => {
                const newCheckedItems = { ...prev };
                if (newCheckedItems[regleId]?.value === value) {
                    delete newCheckedItems[regleId];
                } else {
                    newCheckedItems[regleId] = {
                        value: value,
                        commentaire: newCheckedItems[regleId]?.commentaire || ''
                    };
                    if (value === 'NON_CONFORME') {
                        newCheckedItems[regleId].nonConformeLevel = newCheckedItems[regleId]?.nonConformeLevel || 1;
                    } else {
                        delete newCheckedItems[regleId].nonConformeLevel;
                    }
                }
                console.log('Updated checkedItems:', newCheckedItems);
                return newCheckedItems;
            });
        }
    };
    // Check if all rules are answered
    const isAllRulesAnswered = useMemo(() => {
        if (!formulaire) return false;

        const allRegleIds = formulaire.sectionList.flatMap(section =>
            section.regles.map(regle => regle.id)
        );

        const answeredRegleIds = Object.keys({ ...checkedItems, ...existingReponses });

        return allRegleIds.every(regleId => answeredRegleIds.includes(regleId));
    }, [formulaire, checkedItems, existingReponses]);



    const handleAuditeInfoChange = (field, value) => {
        setAuditeInfo(prev => ({ ...prev, [field]: value }));
    };



const handleSaveAuditeInfo = async () => {
    setIsSubmitting(true);
    setIsAuditeRegistered(true);
    try {
        const formattedDate = observationsurplacedate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    const encodedDate = encodeURIComponent(formattedDate);

      const response = await fetch(`http://172.20.10.3:8080/User/addAudit?auditId=${auditId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: auditeInfo.email,
          fullname: Fullnamo
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save audite info');
      }

      const response2 = await fetch(`http://172.20.10.3:8080/Audit/${auditId}/audite?localDate=${encodedDate}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditeInfo),
      });

      if (!response2.ok) {
        throw new Error('Failed to save audite info');
      }

      Alert.alert('Success', 'Informations de l\'audité enregistrées avec succès!');
    } catch (error) {
      Alert.alert('Error', `Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
    
  useEffect(() => {
    const fetchAuditDetails = async () => {
      try {
        const response = await fetch(`http://172.20.10.3:8080/Audit/${auditId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch audit details');
        }
        const auditData = await response.json();

        setIsAuditeRegistered(auditData.auditeregistred);
        if (auditData.auditeregistred) {
          setAuditeInfo({
            emploi: auditData.audite.emploi,
            phonenumber: auditData.audite.phonenumber,
            email: auditData.audite.email ,
          });
          setFullnamo(auditData.audite.fullname);
          setObservationsurplacedate(auditData.observationsurplacedate ? new Date(auditData.observationsurplacedate) : new Date());

        }
      } catch (error) {
        Alert.alert('Error', `Error fetching audit details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditDetails();
  }, [auditId]);


    const handleNonConformeLevelChange = (regleId, level) => {
        if (isEditable) {
            setCheckedItems(prev => ({
                ...prev,
                [regleId]: {
                    ...prev[regleId],
                    nonConformeLevel: level
                }
            }));
        }
    };
  
  
    const removeRow = () => {
        if (rows.length > initialRowCount) {
          setRows(rows.slice(0, -1));
        }
      };



    
    const handleConfirmSave = async () => {
    setIsSubmitting(true);
    setOpenConfirmDialog(false);

    const reponses = Object.entries({ ...checkedItems, ...existingReponses }).map(([regleId, value]) => ({
      [regleId]: value
    }));

    const payload = {
      audit: { id: auditId },
      reponses: reponses,
    };

    try {
      // Save the response
      const saveResponse = await fetch('http://172.20.10.3:8080/Reponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save data');
      }

      const result = await saveResponse.json();
      setAudit(result.audit);

      if (!result.id) {
        throw new Error('Missing reponseId from save response');
      }

      // Save the PDF
      const pdfResponse = await fetch('http://172.20.10.3:8080/Reponse/save-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rapportId: result.id,
        }),
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to save PDF');
      }

      // Send the first email
      const emailResponse1 = await fetch('http://172.20.10.3:8080/Reponse/send-pdf-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reponseId: result.id }),
      });

      if (!emailResponse1.ok) {
        throw new Error('Failed to send first email');
      }

      // Finalize the response
      const finalise = await fetch(`http://172.20.10.3:8080/Reponse/finalize/${result.id}`, {
        method: 'PUT',
      });

      if (!finalise.ok) {
        throw new Error('Failed to finalize response');
      }

      setIsEditable(false);
      Alert.alert('Succès', 'Données enregistrées, emails envoyés et notifications envoyées avec succès!');
    } catch (error) {
      Alert.alert('Erreur', `Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
 

    const handleCommentChange = (regleId, comment) => {
        setCheckedItems(prev => ({
          ...prev,
          [regleId]: { ...prev[regleId], commentaire: comment }
        }));
      };



    const [selectedCategories, setSelectedCategories] = useState({});

    const handleCategoryChange = (regleId, value) => {
        setSelectedCategories(prevState => ({
            ...prevState,
            [regleId]: value,
        }));
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red' }}>{error}</Text>
            </View>
        );
    }

    if (!formulaire || !audit) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Aucune donnée trouvée.</Text>
            </View>
        );
    }
 
 


    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || observationsurplacedate;
        setShowDatePicker(Platform.OS === 'ios');
        setObservationsurplacedate(currentDate);
      };

      
      const showDatepicker = () => {
        if (Platform.OS === 'android') {
          DateTimePickerAndroid.open({
            value: observationsurplacedate || new Date(),
            onChange: (event, selectedDate) => {
              setObservationsurplacedate(selectedDate || new Date());
            },
            mode: 'date',
          });
        } else {
          setShowDatePicker(true);
        }
      };



    const handleSavepersonne = async () => {
  const newRows = rows.filter(row => !row.isSaved && row.fullName && row.title);
  if (newRows.length === 0) return;

  try {
    setIsSubmitting(true);
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
      setSnackbar({ open: true, message: 'Personnes rencontrées enregistrées avec succès!', severity: 'success' });
    } else {
      throw new Error('Erreur lors de l\'enregistrement des personnes rencontrées');
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des personnes rencontrées:', error);
    setSnackbar({ open: true, message: 'Erreur lors de l\'enregistrement des personnes rencontrées', severity: 'error' });
  } finally {
    setIsSubmitting(false);
  }
};
   
    return (
        <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>AUDIT DE TERRAIN OPÉRATIONNEL</Text>
          </View>
  
          <Text style={styles.descriptionText}>
            Ce document d'évaluation identifie les exigences en matière d'assistance en escale vérifiées par l'auditeur de Royal Air Maroc lors d'un audit initial (évaluation) ou récurrent d'un prestataire d'assistance en escale. Ce document est également utilisé lors d'un audit interne. Les éléments énumérés dans cette liste de contrôle sont censés répondre aux normes de l'OACI, à la réglementation marocaine de l'aviation civile, aux normes IATA & aux règles particulières de Royal Air Maroc.
          </Text>
  
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations de l'audité</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nom complet:</Text>
              <TextInput
                style={styles.textInput}
                value={Fullnamo}
                onChangeText={setFullnamo}
                editable={!isAuditeRegistered}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Emploi:</Text>
              <TextInput
                style={styles.textInput}
                value={auditeInfo.emploi}
                onChangeText={(text) => handleAuditeInfoChange('emploi', text)}
                editable={!isAuditeRegistered}
              />
               <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>Email:</Text>
    <TextInput
      style={styles.textInput}
      value={auditeInfo.email}
      onChangeText={(text) => handleAuditeInfoChange('email', text)}
      editable={!isAuditeRegistered}
      keyboardType="email-address"
    />
  </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Numero de telephone:</Text>
              <TextInput
                style={styles.textInput}
                value={auditeInfo.phonenumber}
                onChangeText={(text) => handleAuditeInfoChange('phonenumber', text)}
                editable={!isAuditeRegistered}
              />
            </View>

            <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Observation sur place Date:</Text>
      <TouchableOpacity onPress={showDatepicker} disabled={isAuditeRegistered}>
        <Text style={[styles.textInput2, isAuditeRegistered && styles.disabledInput]}>
          {observationsurplacedate ? observationsurplacedate.toDateString() : 'Sélectionner une date'}
        </Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' && showDatePicker && (
        <DateTimePicker
          value={observationsurplacedate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
    </View>
            <Button
              mode="contained"
              onPress={handleSaveAuditeInfo}
              disabled={isSubmitting || isAuditeRegistered}
              style={styles.button}
            >
              {isSubmitting ? 'Saving...' : 'Enregistrer'}
            </Button>
          </View>
  
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GENERALITIES</Text>
            {/* Ajoutez ici les champs pour les généralités */}
            {/* Par exemple: */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Summary of airlines assisted:</Text>
              <TextInput
                style={styles.textInput}
                value={summaryOfAirlinesAssisted}
                onChangeText={setSummaryOfAirlinesAssisted}
                editable={!isGeneralitiesSent}
              />
             <Text style={styles.inputLabel}>Number of flights handled per day/month:</Text>

               <TextInput
                 keyboardType='numeric'
                style={styles.textInput}
                value={numberOfFlightsHandled}
                onChangeText={setNumberOfFlightsHandled}
                editable={!isGeneralitiesSent}
              />

               <Text style={styles.inputLabel}>Number of check-in and boarding agents</Text>


               <TextInput
                 keyboardType='numeric'
                style={styles.textInput}
                value={numberOfCheckInAgents}
                onChangeText={setNumberOfCheckInAgents}
                editable={!isGeneralitiesSent}
              />
               <Text style={styles.inputLabel}>Number of ramp agents</Text>

               <TextInput
                 keyboardType='numeric'
                style={styles.textInput}
                value={numberOfRampAgents}
                onChangeText={setNumberOfRampAgents}
                editable={!isGeneralitiesSent}
              />
               <Text style={styles.inputLabel}>Number of supervisors</Text>

               <TextInput
                 keyboardType='numeric'
                style={styles.textInput}
                value={numberOfSupervisors}
                onChangeText={setNumberOfSupervisors}
                editable={!isGeneralitiesSent}
              />
               <Text style={styles.inputLabel}>Number of GSE maintenance</Text>

               <TextInput
               keyboardType='numeric'
                style={styles.textInput}
                value={numberOfGSEMaintenance}
                onChangeText={setNumberOfGSEMaintenance}
                editable={!isGeneralitiesSent}
              />
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
               <Button
          mode="contained"
          onPress={handleSaveGeneralities}
          disabled={isSubmitting || isGeneralitiesSent}
          style={styles.button}
        >
          {isSubmitting ? 'Saving...' : 'Enregistrer Généralités'}
        </Button>
        <Button
          mode="contained"
          onPress={handleSendGeneralities}
          disabled={isSubmitting || isGeneralitiesSent || !isAllFieldsFilled}
          style={[styles.button, { backgroundColor: '#4CAF50' }]}
        >
          {isSubmitting ? 'Sending...' : 'Envoyer Généralités'}
        </Button>
            </View>
          </View>
  
          <View style={styles.section}>
          
          <PersonnesRencontreesTable 
  auditId={auditId}
  rows={rows}
  setRows={setRows}
  addRow={addRow}
  removeRow={removeRow}
  handleChange={handleChange}
  handleSave={handleSavepersonne}
  initialRowCount={initialRowCount}
/>
          </View>
  
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Checklist d'audit</Text>
            <AuditChecklistTable 
            formulaire={formulaire}
            checkedItems={checkedItems}
            handleNonConformeLevelChange={handleNonConformeLevelChange}
            handleCommentChange={handleCommentChange}
            handleCheckboxChange={handleCheckboxChange}
            isEditable={isEditable}
            isSubmitting={isSubmitting}
          />
          </View>
  
          <View style={styles.buttonContainer}>
          {isEditable ? (
            <>
              <Button
                mode="contained"
                onPress={handleSave}
                disabled={isSubmitting}
                style={styles.button}
              >
                {isSubmitting ? 'Saving...' : 'Enregistrer'}
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirmSave}
                disabled={isSubmitting || !reponseId || !isAllRulesAnswered}
                style={[styles.button, { backgroundColor: '#4CAF50' }]}
              >
                {isSubmitting ? 'Sending...' : 'Envoyer'}
              </Button>
            </>
          ) : (
            <Text style={styles.finishedText}>
              Merci pour votre travail, vous avez terminé votre audit
            </Text>
          )}
        </View>
        </ScrollView>
  
        <Snackbar
          visible={snackbar.open}
          onDismiss={() => setSnackbar({ ...snackbar, open: false })}
          duration={6000}
        >
          {snackbar.message}
        </Snackbar>
      </SafeAreaView>
    );
  };
  
export default Reponse;

const styles = StyleSheet.create({
    tableCell: {
        padding: 10,
    },
    tableCellText: {
        fontWeight: 'bold',
        backgroundColor: '#3f51b5', // Replace with theme color
        color: '#fff', // Replace with theme color
    },
    dialogContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dialogContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    dialogTitle: {
        backgroundColor: '#3f51b5', // Replace with theme color
        color: '#fff', // Replace with theme color
        fontSize: 20,
        padding: 10,
        textAlign: 'center',
    },
    row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
    dialogBody: {
        padding: 10,
    },
    dialogActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 10,
    },
    dialogButton: {
        color: '#3f51b5', // Replace with theme color
        fontWeight: 'bold',
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        textAlign: 'justify',
        marginBottom: 15,
        paddingHorizontal: 10,
      },
      
      tableCellTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#444',
        width: '40%', // Adjust this value as needed
        paddingRight: 10,
      },
    sectionRow: {
        backgroundColor: '#f0f0f0', // Replace with theme color
        padding: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    tableContainer: {
        maxHeight: 400,
    },
    sectionContainer: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop:40,
        fontSize:25
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    cell: {
        flex: 1,
        textAlign: 'left',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom:20
    },
    container: {
        flex: 1,
        padding: 16,
    },
    paper: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
    },
    headerContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#C2002F',
        textAlign: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
      },
      iconButton: {
        marginLeft: 10,
      },
    subtitle: {
        marginBottom: 20,
        fontSize: 16,
        lineHeight: 24,
        fontFamily: 'serif',
    },
    disabledInput: {
        color: '#999',
      },
      tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 5,
      },
      textInput2: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        marginBottom: 8,
      },

    table: {
        marginBottom: 20,
    },
    input: {
        fontSize: 14,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
    },
    button: {
        marginTop: 10,
        backgroundColor: '#C2002F',
    },
    rowControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    iconButton: {
        padding: 8,
        borderRadius: 4,
    },
    sectionHeader: {
        backgroundColor: '#f0f0f0',
    },
    sectionText: {
        fontWeight: 'bold',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,   // Add some padding
        margin: 5,
    },
    regleCell: {
        flex: 1,
        flexWrap: 'wrap', // Ensures text wraps if too long
    },
    regleText: {
        fontSize: 14,
        lineHeight: 20,
    },
    checkboxLabel: {
        fontSize: 16,           // Slightly larger font for better visibility
        color: '#333',
        marginLeft: 5,         // Darker color for text
    },
    checkbox: {
        borderWidth: 1,         // Add border to make checkbox more visible
        borderColor: '#ccc',    // Light border color
        width: 24,              // Fixed width for checkbox
        height: 24,             // Fixed height for checkbox
        marginRight: 5,         // Space between checkbox and label
    },
    pickerContainer: {
        justifyContent: 'center',
        flex: 1,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    textInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        marginBottom: 8,
    },
    saveButton: {
        backgroundColor: '#C2002F',
        marginBottom: 8,
    },
    sendButton: {
        backgroundColor: '#4CAF50',
    },
    finishedText: {
        textAlign: 'center',
        color: 'gray',
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
      },
input2: {
    flex: 1,
    padding: 10,
  },
});
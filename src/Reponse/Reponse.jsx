import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator, Modal, TextInput, Alert, StyleSheet, FlatList, ScrollView } from 'react-native';
import { DataTable, Snackbar, Appbar, Dialog, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { Appearance } from 'react-native';
import { IconButton, Button, Checkbox } from 'react-native-paper';
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
        marginBottom: 5,
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
        marginTop: 10,
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
    subtitle: {
        marginBottom: 20,
        fontSize: 16,
        lineHeight: 24,
        fontFamily: 'serif',
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
});

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
                const response = await fetch(`http://192.168.8.106:8080/User/addAudit?auditId=${encodeURIComponent(auditId)}`, {
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

    return (
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
    );
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

    const [auditeInfo, setAuditeInfo] = useState({
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
    }, [
        summaryOfAirlinesAssisted,
        numberOfFlightsHandled,
        numberOfCheckInAgents,
        numberOfRampAgents,
        numberOfSupervisors,
        numberOfGSEMaintenance
    ]);

    const loadExistingGeneralities = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://192.168.8.106:8080/Audit/${auditId}/generalities`);
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
                setError('Failed to load generalities');
            }
        } catch (error) {
            console.error('Error loading existing generalities:', error);
        }
    };

    const handleSaveGeneralities = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`http://192.168.8.106:8080/Audit/${auditId}/generalities`, {
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

            setSnackbar({ open: true, message: 'Généralités sauvegardées avec succès!', severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: `Erreur: ${error.message}`, severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleSendGeneralities = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`http://192.168.8.106:8080/Audit/${auditId}/send-generalities`, {
                method: 'PUT',
            });

            if (!response.ok) {
                throw new Error('Failed to send generalities');
            }

            const updatedAudit = await response.json();
            setIsGeneralitiesSent(updatedAudit.generalitiesSent);
            setSnackbar({ open: true, message: 'Généralités envoyées avec succès!', severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: `Erreur: ${error.message}`, severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleSavePersonnesRencontrees = async () => {
        setIsSubmitting(true);
        try {
            const personnesAEnregistrer = rows
                .filter(row => !row.isSaved && row.fullName && row.title)
                .map(row => ({
                    fullname: row.fullName,
                    title: row.title
                }));

            console.log("Données à envoyer:", personnesAEnregistrer);

            if (personnesAEnregistrer.length === 0) {
                setSnackbar({ open: true, message: 'Aucune nouvelle personne à enregistrer', severity: 'info' });
                return;
            }

            const response = await fetch(`http://192.168.8.106:8080/Audit/${auditId}/personnes-rencontrees`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(personnesAEnregistrer),
            });

            if (!response.ok) {
                throw new Error("Échec de l'enregistrement des personnes rencontrées");
            }

            const updatedAudit = await response.json();
            setRows(updatedAudit.personneRencontresees.map(p => ({
                fullName: p.fullName,
                title: p.title,
                isSaved: true
            })));

            setSnackbar({ open: true, message: 'Personnes rencontrées enregistrées avec succès!', severity: 'success' });
        } catch (error) {
            console.error("Error details:", error);
            setSnackbar({ open: true, message: `Erreur: ${error.message}`, severity: 'error' });
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
            Snackbar.show({
                text: 'Veuillez ajouter un commentaire pour toutes les règles non conformes',
                duration: Snackbar.LENGTH_LONG,
                backgroundColor: 'red',
            });
            setIsSubmitting(false);
            return;
        }

        const reponses = Object.entries(checkedItems).map(([regleId, value]) => {
            const reponse = {
                [regleId]: {
                    value: value.value,
                    commentaire: value.commentaire.trim()
                }
            };

            if (value.value === 'NON_CONFORME' && value.nonConformeLevel) {
                reponse[regleId].nonConformeLevel = value.nonConformeLevel;
            }

            return reponse;
        });

        const payload = {
            audit: { id: auditId },
            reponses: reponses,
            temporary: true
        };

        try {
            const response = await fetch('http://192.168.8.106:8080/Reponse', {
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
            Snackbar.show({
                text: 'Données enregistrées avec succès!',
                duration: Snackbar.LENGTH_LONG,
                backgroundColor: 'green',
            });

            setExistingReponses(prev => ({
                ...prev,
                ...Object.fromEntries(reponses.map(r => [Object.keys(r)[0], Object.values(r)[0]]))
            }));

        } catch (error) {
            Snackbar.show({
                text: `Erreur: ${error.message}`,
                duration: Snackbar.LENGTH_LONG,
                backgroundColor: 'red',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const [rows, setRows] = useState([
        { fullName: '', title: '', isSaved: false },
    ]);

    const addRow = () => {
        setRows([...rows, { fullName: '', title: '', isSaved: false }]);
    };

    const handleChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        console.log(`Updated row ${index}, field ${field} to ${value}`);
        setRows(newRows);
    };
    const handleSend = async () => {
        setOpenConfirmDialog(true);
    };
    const loadExistingReponses = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://192.168.8.106:8080/Reponse/audit/${auditId}`);
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
            console.error('Error loading existing responses:', error);
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
            const auditResponse = await fetch(`http://192.168.8.106:8080/Audit/${auditId}`);
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
            const formulaireResponse = await fetch(`http://192.168.8.106:8080/Formulaire/${formulaireId}`);
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
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://192.168.8.106:8080/Audit/${auditId}/personnes-rencontrees`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const loadedRows = data.map(p => ({
                        fullName: p.fullname,
                        title: p.title,
                        isSaved: true
                    }));
                    setRows(loadedRows);
                    setInitialRowCount(loadedRows.length);
                }
            } else {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
        } catch (error) {
            setError(`Erreur lors du chargement des personnes rencontrées: ${error.message}`);
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
            const encodedDate = encodeURIComponent(observationsurplacedate);

            const response = await fetch(`http://192.168.8.106:8080/User/addAudit?auditId=${auditId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: auditeInfo.email,
                    fullname: auditeInfo.fullname
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save audite info');
            }

            const response2 = await fetch(`http://192.168.8.106:8080/Audit/${auditId}/audite?localDate=${encodedDate}`, {
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
                const response = await fetch(`http://192.168.8.106:8080/Audit/${auditId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch audit details');
                }
                const auditData = await response.json();

                console.log('Audit Data:', auditData);

                setIsAuditeRegistered(auditData.auditeregistred);
                if (auditData.auditeregistred) {
                    setAuditeInfo({
                        email: auditData.audite.email,
                        emploi: auditData.audite.emploi,
                        phonenumber: auditData.audite.phonenumber,
                    });
                    setFullnamo(auditData.audite.fullname);
                    setObservationsurplacedate(auditData.observationsurplacedate);
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
            const saveResponse = await fetch('http://192.168.8.106:8080/Reponse', {
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
            const pdfResponse = await fetch('http://192.168.8.106:8080/Reponse/save-pdf', {
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
            const emailResponse1 = await fetch('http://192.168.8.106:8080/Reponse/send-pdf-email', {
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
            const finalise = await fetch(`http://192.168.8.106:8080/Reponse/finalize/${result.id}`, {
                method: 'PUT',
            });

            if (!finalise.ok) {
                throw new Error('Failed to finalize response');
            }

            setIsEditable(false);
            setSnackbar({ open: true, message: 'Données enregistrées, emails envoyés et notifications envoyées avec succès!', severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: `Erreur: ${error.message}`, severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleCommentChange = (regleId, comment) => {
        if (isEditable) {
            setCheckedItems(prev => ({
                ...prev,
                [regleId]: { ...prev[regleId], commentaire: comment }
            }));
        }
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
    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>

            <View style={styles.headerContainer}>
                <Text style={[styles.headerText, { color: '#C2002F' }]}>
                    AUDIT DE TERRAIN {'\n'} OPÉRATIONNEL
                </Text>
            </View>

            <Text style={styles.descriptionText}>
                Ce document d'évaluation identifie les exigences en matière d'assistance en escale vérifiées par l'auditeur de Royal Air Maroc lors d'un audit initial (évaluation) ou récurrent d'un prestataire d'assistance en escale. Ce document est également utilisé lors d'un audit interne. Les éléments énumérés dans cette liste de contrôle sont censés répondre aux normes de l'OACI, à la réglementation marocaine de l'aviation civile, aux normes IATA & aux règles particulières de Royal Air Maroc.
            </Text>

            <View style={styles.tableContainer}>
                <FlatList
                    data={[
                        { title: 'Nom complet:', value: Fullnamo, onChange: (text) => handleAuditeInfoChange('nomComplet', text) },
                        { title: 'Emploi:', value: auditeInfo.emploi, onChange: (text) => handleAuditeInfoChange('emploi', text) },
                        { title: 'Email:', value: auditeInfo.email, onChange: (text) => handleAuditeInfoChange('email', text) },
                        { title: 'Numero de telephone:', value: auditeInfo.phonenumber, onChange: (text) => handleAuditeInfoChange('phonenumber', text) },
                        { title: 'Observation sur place Date:', value: observationsurplacedate, onChange: (text) => setObservationsurplacedate(text), type: 'date' }
                    ]}
                    keyExtractor={(item) => item.title}
                    renderItem={({ item }) => (
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCellTitle}>{item.title}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={item.value}
                                onChangeText={item.onChange}
                                editable={!isAuditeRegistered}
                                placeholder={item.type === 'date' ? 'Select Date' : ''}
                                keyboardType={item.type === 'date' ? 'default' : 'default'}
                            />
                        </View>
                    )}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    color="#C2002F"
                    onPress={handleSaveAuditeInfo}
                    disabled={isSubmitting || isAuditeRegistered}
                >
                    {isSubmitting ? 'Saving...' : 'Enregistrer'}
                </Button>
            </View>

            <Text style={[styles.headerText, { color: '#C2002F', marginTop: 20 }]}>
                GENERALITIES
            </Text>

            <View style={styles.tableContainer}>
                <FlatList
                    data={[
                        { title: 'Summary of airlines assisted', value: summaryOfAirlinesAssisted, onChange: (text) => setSummaryOfAirlinesAssisted(text) },
                        { title: 'Number of flights handled per day/month', value: numberOfFlightsHandled, onChange: (text) => setNumberOfFlightsHandled(text) },
                        { title: 'Number of check-in and boarding agents', value: numberOfCheckInAgents, onChange: (text) => setNumberOfCheckInAgents(text) },
                        { title: 'Number of ramp agents', value: numberOfRampAgents, onChange: (text) => setNumberOfRampAgents(text) },
                        { title: 'Number of supervisors', value: numberOfSupervisors, onChange: (text) => setNumberOfSupervisors(text) },
                        { title: 'Number of GSE maintenance', value: numberOfGSEMaintenance, onChange: (text) => setNumberOfGSEMaintenance(text) }
                    ]}
                    keyExtractor={(item) => item.title}
                    renderItem={({ item }) => (
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCellTitle}>{item.title}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={item.value}
                                onChangeText={item.onChange}
                                editable={!isGeneralitiesSent}
                            />
                        </View>
                    )}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    color="#C2002F"
                    onPress={handleSaveGeneralities}
                    disabled={isSubmitting || isGeneralitiesSent}
                >
                    {isSubmitting ? 'Saving...' : 'Enregistrer'}
                </Button>
                <Button
                    mode="contained"
                    color="#4CAF50"
                    onPress={handleSendGeneralities}
                    disabled={isSubmitting || isGeneralitiesSent}
                >
                    {isSubmitting ? 'Sending...' : 'Envoyer'}
                </Button>
            </View>

            <Text style={[styles.headerText, { color: '#C2002F', marginTop: 20 }]}>
                Les personnes rencontrées
            </Text>

            <View style={styles.buttonContainer}>
                <IconButton
                    icon="minus"
                    color="#d32f2f"
                    onPress={removeRow}
                    disabled={rows.length <= initialRowCount}
                />
                <IconButton
                    icon="plus"
                    color="#1976d2"
                    onPress={addRow}
                />
            </View>

            <View style={styles.tableContainer}>
                <FlatList
                    data={rows}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.tableRow}>
                            <TextInput
                                style={styles.textInput}
                                value={item.fullName}
                                onChangeText={(text) => handleChange(index, 'fullName', text)}
                                editable={!item.isSaved}
                            />
                            <TextInput
                                style={styles.textInput}
                                value={item.title}
                                onChangeText={(text) => handleChange(index, 'title', text)}
                                editable={!item.isSaved}
                            />
                        </View>
                    )}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    color="#C2002F"
                    onPress={handleSavePersonnesRencontrees}
                    disabled={isSubmitting || !rows.some(row => !row.isSaved && row.fullName && row.title)}
                >
                    {isSubmitting ? 'Saving...' : 'Enregistrer'}
                </Button>
            </View>


            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Sections</DataTable.Title>
                    <DataTable.Title>Règles</DataTable.Title>
                    <DataTable.Title>Conforme</DataTable.Title>
                    <DataTable.Title>Non-Conforme</DataTable.Title>
                    <DataTable.Title>Observation</DataTable.Title>
                    <DataTable.Title>Amélioration</DataTable.Title>
                    <DataTable.Title>Niveau</DataTable.Title>
                    <DataTable.Title>Commentaire</DataTable.Title>
                </DataTable.Header>
                {formulaire.sectionList.map((section, sectionIndex) => (
                    <React.Fragment key={sectionIndex}>
                        <DataTable.Row>
                            <DataTable.Cell colSpan={8} style={styles.sectionHeader}>
                                <Text style={styles.sectionText}>{section.description}</Text>
                            </DataTable.Cell>
                        </DataTable.Row>
                        {section.regles.map((regle, regleIndex) => (
                            <DataTable.Row key={regleIndex}>
                                <DataTable.Cell></DataTable.Cell>
                                <DataTable.Cell>{regle.description}</DataTable.Cell>
                                {['CONFORME', 'NON_CONFORME', 'OBSERVATION', 'AMELIORATION'].map((value) => (
                                    <DataTable.Cell key={value}>
                                        <View style={styles.checkboxContainer}>
                                            <Checkbox
                                                status={checkedItems[regle.id]?.value === value ? 'checked' : 'unchecked'}
                                                onPress={() => handleCheckboxChange(regle.id, value)}
                                                disabled={!isEditable || isSubmitting}
                                                color={
                                                    value === 'CONFORME' ? 'green' :
                                                        value === 'NON_CONFORME' ? 'red' :
                                                            value === 'OBSERVATION' ? 'blue' : 'orange'
                                                }
                                            />
                                            <Text>{value.replace('_', ' ')}</Text>
                                        </View>
                                    </DataTable.Cell>
                                ))}
                                <DataTable.Cell>
                                    <TextInput
                                        style={styles.textInput}
                                        value={checkedItems[regle.id]?.nonConformeLevel || ''}
                                        onChangeText={(text) => handleNonConformeLevelChange(regle.id, text)}
                                        editable={!isEditable || isSubmitting || checkedItems[regle.id]?.value !== 'NON_CONFORME'}
                                        keyboardType='numeric'
                                        placeholder='Level'
                                    />
                                </DataTable.Cell>
                                <DataTable.Cell>
                                    <TextInput
                                        style={styles.textInput}
                                        multiline
                                        numberOfLines={2}
                                        value={checkedItems[regle.id]?.commentaire || ''}
                                        onChangeText={(text) => handleCommentChange(regle.id, text)}
                                        editable={!isEditable || isSubmitting}
                                        placeholder='Commentaire'
                                    />
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </React.Fragment>
                ))}
            </DataTable>

            <View style={styles.buttonContainer}>
                {isEditable ? (
                    <>
                        <Button
                            mode="contained"
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : 'Enregistrer'}
                        </Button>
                        <Button
                            mode="contained"
                            style={styles.sendButton}
                            onPress={handleSend}
                            disabled={isSubmitting || !isAllRulesAnswered}
                        >
                            {isSubmitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : 'Envoyer'}
                        </Button>
                    </>
                ) : (
                    <Text style={styles.finishedText}>
                        Merci pour votre travail, vous avez terminé votre audit
                    </Text>
                )}
            </View>
            <Modal visible={openConfirmDialog} onDismiss={() => setOpenConfirmDialog(false)}>
                <View style={styles.dialogContent}>
                    <Text>Are you sure you want to save?</Text>
                    <Button onPress={handleConfirmSave}>Confirm</Button>
                    <Button onPress={() => setOpenConfirmDialog(false)}>Cancel</Button>
                </View>
            </Modal>
            <Snackbar
                visible={snackbar.open}
                onDismiss={() => setSnackbar({ ...snackbar, open: false })}
                duration={6000}
            >
                <Text>{snackbar.message}</Text>
            </Snackbar>
        </ScrollView>


    );
};



export default Reponse;

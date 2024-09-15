import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Card, DataTable, TextInput, Button } from 'react-native-paper';

const AuditChecklistTable = ({ formulaire, checkedItems, handleCheckboxChange, handleNonConformeLevelChange, handleCommentChange, isEditable, isSubmitting }) => {
  const [localCheckedItems, setLocalCheckedItems] = useState(checkedItems);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRegle, setCurrentRegle] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    setLocalCheckedItems(checkedItems);
  }, [checkedItems]);

  const conformityOptions = [
    { label: 'Conforme', value: 'CONFORME' },
    { label: 'Non Conforme', value: 'NON_CONFORME' },
    { label: 'Observation', value: 'OBSERVATION' },
    { label: 'Amélioration', value: 'AMELIORATION' },
  ];

  const levelOptions = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
  ];

  const openModal = (regle, type) => {
    setCurrentRegle(regle);
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentRegle(null);
    setModalType(null);
  };

  const handleOptionSelect = (regleId, value) => {
    if (modalType === 'conformity') {
      const newCheckedItems = {
        ...localCheckedItems,
        [regleId]: {
          ...localCheckedItems[regleId],
          value: value,
          nonConformeLevel: value === 'NON_CONFORME' ? 1 : undefined
        }
      };
      setLocalCheckedItems(newCheckedItems);
      handleCheckboxChange(regleId, value);
    } else if (modalType === 'level') {
      handleNonConformeLevelChange(regleId, value);
    }
    closeModal();
  };

  const isCommentRequired = (regleId) => {
    return localCheckedItems[regleId]?.value && localCheckedItems[regleId]?.value !== 'CONFORME';
  };

  const getConformityLabel = (value) => {
    return conformityOptions.find(option => option.value === value)?.label || 'Sélectionner la conformité';
  };

  return (
    <ScrollView>
      {formulaire.sectionList.map((section, sectionIndex) => (
        <Card key={sectionIndex} style={styles.sectionCard}>
          <Card.Title title={section.description} titleStyle={styles.sectionTitle} />
          <Card.Content>
            {section.regles.map((regle, regleIndex) => (
              <Card key={regleIndex} style={styles.ruleCard}>
                <Card.Content>
                  <Text style={styles.ruleText}>{regle.description}</Text>
                  <View style={styles.buttonRow}>
                    <Button
                      mode="outlined"
                      onPress={() => openModal(regle, 'conformity')}
                      style={styles.conformityButton}
                      disabled={!isEditable || isSubmitting}
                    >
                      {getConformityLabel(localCheckedItems[regle.id]?.value)}
                    </Button>
                    {localCheckedItems[regle.id]?.value === 'NON_CONFORME' && (
                      <Button
                        mode="outlined"
                        onPress={() => openModal(regle, 'level')}
                        style={styles.levelButton}
                        disabled={!isEditable || isSubmitting}
                      >
                        {localCheckedItems[regle.id]?.nonConformeLevel ? `Niveau ${localCheckedItems[regle.id].nonConformeLevel}` : 'Niveau'}
                      </Button>
                    )}
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      isCommentRequired(regle.id) && !localCheckedItems[regle.id]?.commentaire && styles.requiredInput
                    ]}
                    multiline
                    numberOfLines={2}
                    value={localCheckedItems[regle.id]?.commentaire || ''}
                    onChangeText={(text) => handleCommentChange(regle.id, text)}
                    editable={isEditable && !isSubmitting}
                    placeholder={isCommentRequired(regle.id) ? "Commentaire obligatoire" : "Commentaire (optionnel)"}
                    placeholderTextColor={isCommentRequired(regle.id) ? "red" : "gray"}
                  />
                </Card.Content>
              </Card>
            ))}
          </Card.Content>
        </Card>
      ))}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {modalType === 'conformity' ? 'Sélectionner la conformité' : 'Sélectionner le niveau'}
            </Text>
            {(modalType === 'conformity' ? conformityOptions : levelOptions).map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalButton}
                onPress={() => handleOptionSelect(currentRegle.id, option.value)}
              >
                <Text style={styles.modalButtonText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <Button onPress={closeModal}>Fermer</Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

  
   
const styles = StyleSheet.create({
  sectionCard: {
    margin: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ruleCard: {
    marginVertical: 10,
    elevation: 2,
  },
  ruleText: {
    fontSize: 14,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  conformityButton: {
    flex: 1,
    marginRight: 5,
  },
  levelButton: {
    flex: 1,
    marginLeft: 5,
  },
  textInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  requiredInput: {
    borderColor: 'red',
    borderWidth: 1,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  modalButtonText: {
    textAlign: 'center',
  },
});

export default AuditChecklistTable;
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckBox } from 'react-native-elements'
import UploadWidget from './UploadWidget';

const Audite = ({ route }) => {
    const [auditData, setAuditData] = useState(null);
    const [rules, setRules] = useState([]);
    const [formDataList, setFormDataList] = useState([]);
    const [submittedForms, setSubmittedForms] = useState([]);
    const {userId} =route.params;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuditee, setIsAuditee] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);



    const handleFileUploaded = (newFile) => {
      setUploadedFiles(prevFiles => [...prevFiles, newFile]);
    };



useEffect(()=>{

  console.log("hhhh "+ userId)

},[userId])



useEffect(() => {
  fetchAuditDetails();
}, [userId]);

const fetchAuditDetails = async () => {
  if (!userId) {
      console.error('User ID is undefined');
      return;
  }

  try {
      setLoading(true);
      const auditResponse = await fetch(`http://172.20.10.3:8080/Audit/audite/${userId}`, {
          headers: {
              'Content-Type': 'application/json',
          },
      });

      if (!auditResponse.ok) {
          throw new Error('Network response was not ok');
      }

      const auditData = await auditResponse.json();
      console.log('Fetched Audit Data:', auditData);

      if (auditData && Array.isArray(auditData) && auditData.length > 0) {
          const audit = auditData.find(a => a.audite && a.audite.id === userId);

          if (audit) {
              setIsAuditee(true);
              setAuditData(audit);

              if (audit.id) {
                  const responseResponse = await fetch(`http://172.20.10.3:8080/Reponse/audit/${audit.id}`, {
                      headers: {
                          'Content-Type': 'application/json',
                      },
                  });

                  if (!responseResponse.ok) {
                      throw new Error('Network response was not ok');
                  }

                  const responsesData = await responseResponse.json();
                  console.log('Fetched Responses Data:', responsesData);

                  if (responsesData && Array.isArray(responsesData.reponses)) {
                      const filteredRules = responsesData.reponses.filter(rule => rule.value !== 'CONFORME');
                      setRules(filteredRules);

                      // Fetch submitted forms
                      const submittedFormsResponse = await fetch(`http://172.20.10.3:8080/ActionCorrectiveRegister/audit/${audit.id}`, {
                          headers: {
                              'Content-Type': 'application/json',
                          },
                      });

                      if (!submittedFormsResponse.ok) {
                          throw new Error('Network response was not ok');
                      }

                      const submittedFormsData = await submittedFormsResponse.json();
                      setSubmittedForms(submittedFormsData);

                      // Initialize formDataList with submitted data or empty objects
                      setFormDataList(filteredRules.map((rule, index) => {
                          const submittedForm = submittedFormsData.find(form => form.registerdornot && form.registerdornot.index === index);
                          return submittedForm ? {
                              rootCause: submittedForm.rootcause || '',
                              implementationOfCorrectiveAction: submittedForm.implementationofthecorrectiveaction || '',
                              responsable: submittedForm.responsable || '',
                              responsibleOfTheProcessus: submittedForm.responsibleoftheprocessus || '',
                          } : {
                              rootCause: '',
                              implementationOfCorrectiveAction: '',
                              responsable: '',
                              responsibleOfTheProcessus: '',
                          };
                      }));
                  } else {
                      console.error('Responses data is not in the expected format:', responsesData);
                      setRules([]);
                  }
              }
          } else {
              console.log('No matching audit data found for this user.');
              setIsAuditee(false);
          }
      } else {
          console.log('Audit data is empty or not in expected format.');
          setIsAuditee(false);
      }
  } catch (error) {
      console.error('Error fetching audit details:', error);
      setError(error.message);
  } finally {
      setLoading(false);
  }
};

const handleInputChange = (index, field, value) => {
  setFormDataList(prevState => {
      const newState = [...prevState];
      newState[index] = { ...newState[index], [field]: value };
      return newState;
  });
};

const handleSubmit = async (index) => {
  if (!auditData || !auditData.id) {
      console.error('Audit data is not available');
      return;
  }

  const actionCorrectiveRegister = {
      audit: auditData,
      rootcause: formDataList[index].rootCause,
      implementationofthecorrectiveaction: formDataList[index].implementationOfCorrectiveAction,
      responsable: formDataList[index].responsable,
      responsibleoftheprocessus: formDataList[index].responsibleOfTheProcessus,
      uploadedFiles: uploadedFiles,
      registerdornot: {
          isSubmitted: true,
          index: index
      }
  };

  try {
      const response = await fetch('http://172.20.10.3:8080/ActionCorrectiveRegister', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(actionCorrectiveRegister),
      });

      if (!response.ok) {
          throw new Error('Failed to submit corrective action');
      }

      const result = await response.json();
      console.log('Corrective action registered:', result);
      
      // Update submittedForms state
      setSubmittedForms(prevState => [...prevState, result]);

      // Refresh the data
      fetchAuditDetails();
  } catch (error) {
      console.error('Error submitting corrective action:', error);
  }
};





 const renderForm = (rule, index) => {
    const isSubmitted = submittedForms.some(form => form.registerdornot && form.registerdornot.index === index);

    return (
      <View key={`form-${index}`} style={styles.formContainer}>
        <Text style={styles.formTitle}>Form {index + 1}</Text>
        
           <Text style={styles.label}>Corrective action: N° {index + 1}</Text>
          <Text style={styles.label}>Audit Station: {auditData?.escaleVille || 'XXX'}</Text>
 
           <Text style={styles.label}>Subject: Audit of the Ground handler</Text>
 
        <Text style={styles.label}>Audited Process: Ground Handling</Text>


        <View style={styles.nonConformityContainer}>
                    <Text style={[styles.label, styles.errorText]}>Non-Conformity:</Text>
                    <CheckBox
                        checked={rule.value === 'NON_CONFORME'}
                        disabled
                        containerStyle={styles.checkbox}
                    />
                </View>

                <View style={styles.noteContainer}>
                    <Text style={[styles.label, styles.errorText]}>Note:</Text>
                    <CheckBox
                        checked={rule.value === 'OBSERVATION' || rule.value === 'AMELIORATION'}
                        disabled
                        containerStyle={styles.checkbox}
                    />
                </View>

                <View style={styles.catContainer}>
                    <Text style={[styles.label, styles.errorText]}>CAT:</Text>
                    <View style={styles.catCheckboxes}>
                        {[1, 2, 3].map((level) => (
                            <CheckBox
                                key={`cat-${level}`}
                                title={`${level}`}
                                checked={rule.nonConformeLevel === level}
                                disabled
                                containerStyle={styles.checkbox}
                            />
                        ))}
                    </View>
                </View>



        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Finding:</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            editable={false}
            value={rule.regle.description || ''}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Root Cause:</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            value={formDataList[index]?.rootCause || ''}
            onChangeText={(text) => handleInputChange(index, 'rootCause', text)}
            editable={!isSubmitted}
          />
        </View>

        <Text style={styles.label}>Responsible of the Audit :</Text>
        <View style={{flexDirection : 'row' ,justifyContent:'space-between'}}>
 
        <Text> Auditor: {auditData?.auditeur.fullname || 'XXX'}</Text>
        
        <Text> Audited:  {auditData?.audite.fullname || 'XXX'}</Text>
        </View>

        <Text style={styles.label}>Definition of Corrective Action: :</Text>

        <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            value={rule.regle.actionCorrective || ''}
            editable={false}
           
          />

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Responsable:</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            value={formDataList[index]?.responsable || ''}
            onChangeText={(text) => handleInputChange(index, 'responsable', text)}
            editable={!isSubmitted}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Implementation of the Corrective Action:</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            value={formDataList[index]?.implementationOfCorrectiveAction || ''}
            onChangeText={(text) => handleInputChange(index, 'implementationOfCorrectiveAction', text)}
            editable={!isSubmitted}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Responsible of the Processus :</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={3}
            value={formDataList[index]?.responsibleOfTheProcessus || ''}
            onChangeText={(text) => handleInputChange(index, 'responsibleOfTheProcessus', text)}
            editable={!isSubmitted}
          />
        </View>

        

          <UploadWidget 
          onFileUploaded={handleFileUploaded} 
          disabled={isSubmitted} 
        />

        <TouchableOpacity
          style={[styles.submitButton, isSubmitted && styles.disabledButton]}
          onPress={() => handleSubmit(index)}
          disabled={isSubmitted}
        >
          <Text style={styles.submitButtonText}>Corrective action taken</Text>
        </TouchableOpacity>
      </View>
    );
  }; 

  return (

    <ScrollView style={styles.container}>
    <SafeAreaView>
    <Text style={styles.title}>Formulaire Fiche d'action corrective</Text>
    {rules.map((rule, index) => renderForm(rule, index))}
    </SafeAreaView>
</ScrollView>

 

  ); 
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C2002F',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C2002F',
    marginBottom: 10,
    marginTop:30
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#C2002F',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#FFB3B3',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Audite;
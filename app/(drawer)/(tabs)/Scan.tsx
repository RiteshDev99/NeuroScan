import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { NeuroScanWithGemini } from '@/src/api/gemini-api';

interface AnalysisResult {
    error?: string;
    message?: string;
    mostLikelyCondition?: string;
    otherPossibleConditions?: string[];
    severityLevel?: string;
    visibleBrainCharacteristics?: {
        lesionType?: string;
        color?: string;
        texture?: string;
        borders?: string;
        distributionPattern?: string;
        inflammation?: string;
        infectionSigns?: string;
        cutsWoundsAbrasions?: string;
        bleeding?: string;
    };
    clarityNote?: string;
    urgencyAssessment?: string;
    recommendedNextSteps?: string[];
}

const ImageTab: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    const pickImage = async () => {
        try {
            const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera roll permissions to select images.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                setUploading(true);
                setSelectedImage(uri);
                setAnalysisResult(null);
                setUploading(false);

                await analyzeImage(uri);
            }
        } catch (error) {
            console.error('pickImage error:', error);
            Alert.alert('Error', 'Failed to pick image');
            setUploading(false);
        }
    };

    const parseGeminiResponse = (response: any): AnalysisResult => {
        try {
            // If it's already an object with expected fields, return as-is
            if (response && typeof response === 'object' && !Array.isArray(response)) {
                return response as AnalysisResult;
            }

            if (typeof response === 'string') {
                let responseText = response.trim();

                // Remove markdown code blocks if present
                if (responseText.startsWith('```json') || responseText.startsWith('```')) {
                    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                }

                // Check for INVALID_IMAGE_TYPE error
                if (responseText.includes('INVALID_IMAGE_TYPE')) {
                    try {
                        const errObj = JSON.parse(responseText);
                        return errObj as AnalysisResult;
                    } catch {
                        return {
                            error: 'INVALID_IMAGE_TYPE',
                            message: "This image does not appear to be a brain MRI scan.",
                        };
                    }
                }

                // Try to parse as JSON first
                try {
                    const jsonObj = JSON.parse(responseText);

                    // Map the JSON structure to our AnalysisResult interface
                    const result: AnalysisResult = {
                        mostLikelyCondition: jsonObj['Most Likely Condition'] || jsonObj.mostLikelyCondition,
                        otherPossibleConditions: jsonObj['Other Possible Conditions'] || jsonObj.otherPossibleConditions,
                        severityLevel: jsonObj['Severity Level'] || jsonObj.severityLevel,
                        clarityNote: jsonObj['Clarity Note'] || jsonObj.clarityNote,
                        urgencyAssessment: jsonObj['Urgency Assessment'] || jsonObj.urgencyAssessment,
                        recommendedNextSteps: jsonObj['Recommended Next Steps'] || jsonObj.recommendedNextSteps,
                    };

                    // Map Visible Brain Characteristics
                    const characteristics = jsonObj['Visible Brain Characteristics'] || jsonObj.visibleBrainCharacteristics;
                    if (characteristics) {
                        result.visibleBrainCharacteristics = {
                            lesionType: characteristics['Lesion Type'] || characteristics.lesionType,
                            color: characteristics['Color'] || characteristics.color,
                            texture: characteristics['Texture'] || characteristics.texture,
                            borders: characteristics['Borders'] || characteristics.borders,
                            distributionPattern: characteristics['Distribution Pattern'] || characteristics.distributionPattern,
                            inflammation: characteristics['Inflammation'] || characteristics.inflammation,
                            infectionSigns: characteristics['Infection Signs'] || characteristics.infectionSigns,
                            cutsWoundsAbrasions: characteristics['Cuts Wounds Abrasions'] || characteristics.cutsWoundsAbrasions,
                            bleeding: characteristics['Bleeding'] || characteristics.bleeding,
                        };
                    }

                    console.log('Successfully parsed JSON response:', result);
                    return result;
                } catch (jsonError) {
                    console.log('JSON parsing failed, using regex parser');
                }

                // Fallback: Parse using regex (for non-JSON formatted responses)
                const result: AnalysisResult = {};

                // Parse Most Likely Condition
                const conditionMatch = responseText.match(/(?:1\.\s*)?Most Likely Condition\s*[:-]\s*(.+?)(?=\n|2\.|Other Possible)/s);
                if (conditionMatch) result.mostLikelyCondition = conditionMatch[1].trim();

                // Parse Other Possible Conditions
                const otherConditionsMatch = responseText.match(/(?:2\.\s*)?Other Possible Conditions[:\s]*\[?\s*([\s\S]*?)(?=\n\s*(?:3\.|Severity Level|$))/);
                if (otherConditionsMatch) {
                    const condText = otherConditionsMatch[1];
                    if (condText.includes('[') && condText.includes(']')) {
                        try {
                            const parsed = JSON.parse(condText.match(/\[[\s\S]*\]/)?.[0] || '[]');
                            result.otherPossibleConditions = parsed;
                        } catch {
                            result.otherPossibleConditions = [];
                        }
                    } else {
                        const conditions = condText
                            .split('\n')
                            .map((line: string) => line.replace(/^\s*[-"*]\s*/, '').replace(/[",]/g, '').trim())
                            .filter((line: string) => line.length > 0 && !line.includes('Severity Level'));
                        result.otherPossibleConditions = conditions;
                    }
                }

                // Parse Severity Level
                const severityMatch = responseText.match(/(?:3\.\s*)?Severity Level\s*[:-]\s*(.+?)(?=\n|4\.|Visible)/s);
                if (severityMatch) result.severityLevel = severityMatch[1].trim().replace(/[",]/g, '');

                // Parse Visible Brain Characteristics
                const characteristicsMatch = responseText.match(/(?:4\.\s*)?Visible Brain Characteristics[:\s]*(\{[\s\S]*?\})/);
                if (characteristicsMatch) {
                    try {
                        const charObj = JSON.parse(characteristicsMatch[1]);
                        result.visibleBrainCharacteristics = {
                            lesionType: charObj['Lesion Type'] || charObj.lesionType,
                            color: charObj['Color'] || charObj.color,
                            texture: charObj['Texture'] || charObj.texture,
                            borders: charObj['Borders'] || charObj.borders,
                            distributionPattern: charObj['Distribution Pattern'] || charObj.distributionPattern,
                            inflammation: charObj['Inflammation'] || charObj.inflammation,
                            infectionSigns: charObj['Infection Signs'] || charObj.infectionSigns,
                            cutsWoundsAbrasions: charObj['Cuts Wounds Abrasions'] || charObj.cutsWoundsAbrasions,
                            bleeding: charObj['Bleeding'] || charObj.bleeding,
                        };
                    } catch {
                        const charText = characteristicsMatch[1];
                        const characteristics: any = {};

                        const lesionTypeMatch = charText.match(/["']?Lesion Type["']?\s*:\s*["']?(.+?)["']?(?=,|\})/i);
                        if (lesionTypeMatch) characteristics.lesionType = lesionTypeMatch[1].trim();

                        const colorMatch = charText.match(/["']?Color["']?\s*:\s*["']?(.+?)["']?(?=,|\})/i);
                        if (colorMatch) characteristics.color = colorMatch[1].trim();

                        const textureMatch = charText.match(/["']?Texture["']?\s*:\s*["']?(.+?)["']?(?=,|\})/i);
                        if (textureMatch) characteristics.texture = textureMatch[1].trim();

                        const bordersMatch = charText.match(/["']?Borders["']?\s*:\s*["']?(.+?)["']?(?=,|\})/i);
                        if (bordersMatch) characteristics.borders = bordersMatch[1].trim();

                        const distributionMatch = charText.match(/["']?Distribution Pattern["']?\s*:\s*["']?(.+?)["']?(?=,|\})/i);
                        if (distributionMatch) characteristics.distributionPattern = distributionMatch[1].trim();

                        const inflammationMatch = charText.match(/["']?Inflammation["']?\s*:\s*["']?(.+?)["']?(?=,|\})/i);
                        if (inflammationMatch) characteristics.inflammation = inflammationMatch[1].trim();

                        result.visibleBrainCharacteristics = characteristics;
                    }
                }

                // Parse Clarity Note
                const clarityMatch = responseText.match(/(?:5\.\s*)?Clarity Note\s*[:-]\s*["']?(.+?)["']?(?=,?\n|6\.|Urgency)/s);
                if (clarityMatch) result.clarityNote = clarityMatch[1].trim().replace(/[",]/g, '');

                // Parse Urgency Assessment
                const urgencyMatch = responseText.match(/(?:6\.\s*)?Urgency Assessment\s*[:-]\s*["']?(.+?)["']?(?=,?\n|7\.|Recommended)/s);
                if (urgencyMatch) result.urgencyAssessment = urgencyMatch[1].trim().replace(/[",]/g, '');

                // Parse Recommended Next Steps
                const stepsMatch = responseText.match(/(?:7\.\s*)?Recommended Next Steps[:\s]*\[?\s*([\s\S]*?)(?:\]|$)/);
                if (stepsMatch) {
                    const stepsText = stepsMatch[1];
                    if (stepsText.includes('[') || stepsText.includes('"')) {
                        try {
                            const parsed = JSON.parse(stepsText.match(/\[[\s\S]*\]/)?.[0] || '[]');
                            result.recommendedNextSteps = parsed;
                        } catch {
                            const steps = stepsText
                                .split('\n')
                                .map((line: string) => line.replace(/^\s*[-"*]\s*/, '').replace(/[",]/g, '').trim())
                                .filter((line: string) => line.length > 0);
                            result.recommendedNextSteps = steps;
                        }
                    } else {
                        const steps = stepsText
                            .split('\n')
                            .map((line: string) => line.replace(/^\s*[-"*]\s*/, '').trim())
                            .filter((line: string) => line.length > 0);
                        result.recommendedNextSteps = steps;
                    }
                }

                return result;
            }

            return {};
        } catch (err) {
            console.error('Parse Error:', err);
            return {};
        }
    };

    const analyzeImage = async (imageUri: string) => {
        try {
            setAnalyzing(true);
            setAnalysisResult(null);

            const base64data = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const response = await NeuroScanWithGemini(base64data);

            console.log('=== GEMINI RESPONSE ===');
            console.log('Raw Response:', response);
            console.log('Response Type:', typeof response);
            console.log('======================');

            const parsedResult = parseGeminiResponse(response);
            console.log('Parsed Result:', JSON.stringify(parsedResult, null, 2));

            if (parsedResult?.error === 'INVALID_IMAGE_TYPE') {
                Alert.alert('Invalid Image Type', parsedResult.message || 'Please upload a brain MRI scan image.');
                setSelectedImage(null);
                setAnalysisResult(null);
                return;
            }

            setAnalysisResult(parsedResult);
        } catch (error) {
            console.error('Analysis Error:', error);
            Alert.alert('Analysis Failed', 'Unable to analyze the image. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setAnalysisResult(null);
    };

    const getSeverityColor = (severity?: string) => {
        const level = severity?.toLowerCase() || '';
        if (level.includes('severe') || level.includes('advanced')) return '#ef4444';
        if (level.includes('moderate')) return '#f59e0b';
        return '#10b981';
    };

    const getUrgencyColor = (urgency?: string) => {
        const level = urgency?.toLowerCase() || '';
        if (level.includes('urgent') || level.includes('immediate')) return '#ef4444';
        if (level.includes('prompt') || level.includes('within')) return '#f59e0b';
        return '#10b981';
    };

    return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
            <ScrollView style={{flex: 1, paddingHorizontal: 15}} showsVerticalScrollIndicator={false}>
                {!selectedImage ? (
                    <View style={{alignItems: 'center', paddingVertical: 55}}>
                        <TouchableOpacity
                            onPress={pickImage}
                            disabled={uploading}
                            activeOpacity={0.8}
                            style={{
                                backgroundColor: '#3b82f6',
                                borderRadius: 24,
                                padding: 32,
                                width: '100%',
                                maxWidth: 400,
                                shadowColor: '#3b82f6',
                                shadowOffset: {width: 0, height: 4},
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8,
                            }}
                        >
                            <View style={{alignItems: 'center'}}>
                                <View
                                    style={{backgroundColor: 'white', borderRadius: 50, padding: 24, marginBottom: 16}}>
                                    <Ionicons name="cloud-upload-outline" size={64} color="#3b82f6"/>
                                </View>
                                <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8}}>
                                    {uploading ? 'Uploading...' : 'Upload MRI Scan'}
                                </Text>
                                <Text style={{color: '#e9d5ff', textAlign: 'center'}}>
                                    Select a brain MRI scan from your gallery
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={{marginTop: 48, flexDirection: 'row', justifyContent: 'center', gap: 16}}>
                            <View style={{backgroundColor: '#f3e8ff', borderRadius: 50, padding: 16}}>
                                <Ionicons name="scan-outline" size={32} color="#9333ea"/>
                            </View>
                            <View style={{backgroundColor: '#fce7f3', borderRadius: 50, padding: 16}}>
                                <Ionicons name="medical-outline" size={32} color="#ec4899"/>
                            </View>
                            <View style={{backgroundColor: '#dbeafe', borderRadius: 50, padding: 16}}>
                                <Ionicons name="analytics-outline" size={32} color="#3b82f6"/>
                            </View>
                        </View>

                        <View style={{
                            marginTop: 40,
                            backgroundColor: '#eff6ff',
                            borderRadius: 16,
                            padding: 20,
                            borderLeftWidth: 4,
                            borderLeftColor: '#3b82f6'
                        }}>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                                <Ionicons name="information-circle" size={24} color="#3b82f6"/>
                                <Text style={{color: '#1e40af', fontWeight: 'bold', marginLeft: 8, fontSize: 16}}>
                                    Important Note
                                </Text>
                            </View>
                            <Text style={{color: '#1e3a8a', fontSize: 14, lineHeight: 20}}>
                                Please ensure you upload a valid brain MRI scan. The AI system is specifically trained
                                to analyze brain MRI images for Alzheimer's Disease detection. Other image types will be
                                rejected.
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={{paddingBottom: 32, marginTop: 24}}>
                        <View style={{
                            backgroundColor: 'white',
                            borderRadius: 24,
                            padding: 16,
                            shadowColor: '#000',
                            shadowOffset: {width: 0, height: 2},
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 5,
                            marginBottom: 24
                        }}>
                            <Image source={{uri: selectedImage}} style={{width: '100%', height: 320, borderRadius: 16}}
                                   resizeMode="contain"/>

                            <View style={{flexDirection: 'row', marginTop: 24, gap: 12}}>
                                <TouchableOpacity onPress={removeImage} activeOpacity={0.8} style={{
                                    flex: 1,
                                    backgroundColor: '#ef4444',
                                    borderRadius: 12,
                                    paddingVertical: 16
                                }}>
                                    <View
                                        style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                        <Ionicons name="trash-outline" size={20} color="white"/>
                                        <Text style={{color: 'white', fontWeight: 'bold', marginLeft: 8}}>Remove</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={{
                                    flex: 1,
                                    backgroundColor: '#9333ea',
                                    borderRadius: 12,
                                    paddingVertical: 16
                                }}>
                                    <View
                                        style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                        <Ionicons name="sync-outline" size={20} color="white"/>
                                        <Text style={{color: 'white', fontWeight: 'bold', marginLeft: 8}}>Change</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {analyzing ? (
                            <View style={{
                                backgroundColor: 'white',
                                borderRadius: 24,
                                padding: 32,
                                shadowColor: '#000',
                                shadowOffset: {width: 0, height: 2},
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 5,
                                alignItems: 'center'
                            }}>
                                <ActivityIndicator size="large" color="#9333ea"/>
                                <Text style={{color: '#374151', fontWeight: '600', marginTop: 16, fontSize: 18}}>
                                    Analyzing MRI Scan...
                                </Text>
                                <Text style={{color: '#6b7280', marginTop: 8, textAlign: 'center'}}>
                                    AI is examining brain structures for Alzheimer's indicators
                                </Text>
                            </View>
                        ) : analysisResult ? (
                            <View style={{gap: 16}}>
                                <View style={{
                                    backgroundColor: '#10b981',
                                    borderRadius: 16,
                                    padding: 16,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: {width: 0, height: 2},
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 5
                                }}>
                                    <View style={{
                                        backgroundColor: 'white',
                                        borderRadius: 50,
                                        padding: 8,
                                        marginRight: 12
                                    }}>
                                        <Ionicons name="checkmark-circle" size={32} color="#10b981"/>
                                    </View>
                                    <View style={{flex: 1}}>
                                        <Text style={{color: 'white', fontWeight: 'bold', fontSize: 18}}>Analysis
                                            Complete</Text>
                                        <Text style={{color: '#d1fae5', fontSize: 14}}>Detailed results below</Text>
                                    </View>
                                </View>

                                {analysisResult.mostLikelyCondition && (
                                    <View style={{
                                        backgroundColor: 'white',
                                        borderRadius: 16,
                                        padding: 24,
                                        shadowColor: '#000',
                                        shadowOffset: {width: 0, height: 2},
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 5
                                    }}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                                            <View style={{
                                                backgroundColor: '#f3e8ff',
                                                borderRadius: 50,
                                                padding: 8,
                                                marginRight: 12
                                            }}>
                                                <Ionicons name="medical-outline" size={24} color="#9333ea"/>
                                            </View>
                                            <Text style={{color: '#1f2937', fontWeight: 'bold', fontSize: 18}}>Primary
                                                Assessment</Text>
                                        </View>
                                        <View style={{
                                            backgroundColor: '#faf5ff',
                                            borderRadius: 12,
                                            padding: 16,
                                            borderLeftWidth: 4,
                                            borderLeftColor: '#9333ea'
                                        }}>
                                            <Text style={{
                                                color: '#374151',
                                                fontSize: 16,
                                                fontWeight: '600',
                                                lineHeight: 24
                                            }}>
                                                {analysisResult.mostLikelyCondition}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {analysisResult.otherPossibleConditions && analysisResult.otherPossibleConditions.length > 0 && (
                                    <View style={{
                                        backgroundColor: 'white',
                                        borderRadius: 16,
                                        padding: 24,
                                        shadowColor: '#000',
                                        shadowOffset: {width: 0, height: 2},
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 5
                                    }}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
                                            <View style={{
                                                backgroundColor: '#e0e7ff',
                                                borderRadius: 50,
                                                padding: 8,
                                                marginRight: 12
                                            }}>
                                                <Ionicons name="list-outline" size={24} color="#6366f1"/>
                                            </View>
                                            <Text style={{color: '#1f2937', fontWeight: 'bold', fontSize: 18}}>Differential
                                                Diagnoses</Text>
                                        </View>
                                        {analysisResult.otherPossibleConditions.map((condition, index) => (
                                            <View key={index} style={{
                                                flexDirection: 'row',
                                                marginBottom: 10,
                                                alignItems: 'center',
                                                backgroundColor: '#f8fafc',
                                                padding: 12,
                                                borderRadius: 8
                                            }}>
                                                <View style={{
                                                    backgroundColor: '#6366f1',
                                                    borderRadius: 12,
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 4,
                                                    marginRight: 12
                                                }}>
                                                    <Text style={{
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: 12
                                                    }}>{index + 1}</Text>
                                                </View>
                                                <Text style={{
                                                    color: '#374151',
                                                    flex: 1,
                                                    fontSize: 15,
                                                    lineHeight: 22
                                                }}>{condition}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={{flexDirection: 'row', gap: 12}}>
                                    {analysisResult.severityLevel && (
                                        <View style={{
                                            flex: 1,
                                            backgroundColor: 'white',
                                            borderRadius: 16,
                                            padding: 20,
                                            shadowColor: '#000',
                                            shadowOffset: {width: 0, height: 2},
                                            shadowOpacity: 0.1,
                                            shadowRadius: 8,
                                            elevation: 5
                                        }}>
                                            <View style={{alignItems: 'center', marginBottom: 12}}>
                                                <View style={{
                                                    backgroundColor: '#fed7aa',
                                                    borderRadius: 50,
                                                    padding: 8,
                                                    marginBottom: 8
                                                }}>
                                                    <Ionicons name="pulse-outline" size={24} color="#f59e0b"/>
                                                </View>
                                                <Text style={{
                                                    color: '#6b7280',
                                                    fontSize: 14,
                                                    fontWeight: '600'
                                                }}>Severity</Text>
                                            </View>
                                            <View style={{
                                                borderRadius: 12,
                                                paddingHorizontal: 12,
                                                paddingVertical: 8,
                                                backgroundColor: getSeverityColor(analysisResult.severityLevel) + '20',
                                                alignItems: 'center'
                                            }}>
                                                <Text style={{
                                                    fontWeight: 'bold',
                                                    fontSize: 14,
                                                    textAlign: 'center',
                                                    color: getSeverityColor(analysisResult.severityLevel),
                                                    lineHeight: 20
                                                }}>
                                                    {analysisResult.severityLevel}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {analysisResult.urgencyAssessment && (
                                        <View style={{
                                            flex: 1,
                                            backgroundColor: 'white',
                                            borderRadius: 16,
                                            padding: 20,
                                            shadowColor: '#000',
                                            shadowOffset: {width: 0, height: 2},
                                            shadowOpacity: 0.1,
                                            shadowRadius: 8,
                                            elevation: 5
                                        }}>
                                            <View style={{alignItems: 'center', marginBottom: 12}}>
                                                <View style={{
                                                    backgroundColor: '#dbeafe',
                                                    borderRadius: 50,
                                                    padding: 8,
                                                    marginBottom: 8
                                                }}>
                                                    <Ionicons name="time-outline" size={24} color="#3b82f6"/>
                                                </View>
                                                <Text style={{
                                                    color: '#6b7280',
                                                    fontSize: 14,
                                                    fontWeight: '600'
                                                }}>Urgency</Text>
                                            </View>
                                            <View style={{
                                                borderRadius: 12,
                                                paddingHorizontal: 12,
                                                paddingVertical: 8,
                                                backgroundColor: getUrgencyColor(analysisResult.urgencyAssessment) + '20',
                                                alignItems: 'center'
                                            }}>
                                                <Text style={{
                                                    fontWeight: 'bold',
                                                    fontSize: 12,
                                                    textAlign: 'center',
                                                    color: getUrgencyColor(analysisResult.urgencyAssessment),
                                                    lineHeight: 18
                                                }}>
                                                    {analysisResult.urgencyAssessment}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {analysisResult.visibleBrainCharacteristics && Object.keys(analysisResult.visibleBrainCharacteristics).length > 0 && (
                                    <View style={{
                                        backgroundColor: 'white',
                                        borderRadius: 16,
                                        padding: 24,
                                        shadowColor: '#000',
                                        shadowOffset: {width: 0, height: 2},
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 5
                                    }}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
                                            <View style={{
                                                backgroundColor: '#e0f2fe',
                                                borderRadius: 50,
                                                padding: 8,
                                                marginRight: 12
                                            }}>
                                                <Ionicons name="eye-outline" size={24} color="#0284c7"/>
                                            </View>
                                            <Text style={{color: '#1f2937', fontWeight: 'bold', fontSize: 18}}>Brain
                                                Imaging Findings</Text>
                                        </View>

                                        <View style={{gap: 12}}>
                                            {analysisResult.visibleBrainCharacteristics.lesionType && (
                                                <View
                                                    style={{backgroundColor: '#f8fafc', padding: 14, borderRadius: 8}}>
                                                    <Text style={{
                                                        color: '#6b7280',
                                                        fontSize: 13,
                                                        fontWeight: '600',
                                                        marginBottom: 4
                                                    }}>Findings:</Text>
                                                    <Text style={{
                                                        color: '#374151',
                                                        fontSize: 14,
                                                        lineHeight: 20
                                                    }}>{analysisResult.visibleBrainCharacteristics.lesionType}</Text>
                                                </View>
                                            )}
                                            {analysisResult.visibleBrainCharacteristics.color && (
                                                <View
                                                    style={{backgroundColor: '#f8fafc', padding: 14, borderRadius: 8}}>
                                                    <Text style={{
                                                        color: '#6b7280',
                                                        fontSize: 13,
                                                        fontWeight: '600',
                                                        marginBottom: 4
                                                    }}>Intensity:</Text>
                                                    <Text style={{
                                                        color: '#374151',
                                                        fontSize: 14,
                                                        lineHeight: 20
                                                    }}>{analysisResult.visibleBrainCharacteristics.color}</Text>
                                                </View>
                                            )}
                                            {analysisResult.visibleBrainCharacteristics.texture && (
                                                <View
                                                    style={{backgroundColor: '#f8fafc', padding: 14, borderRadius: 8}}>
                                                    <Text style={{
                                                        color: '#6b7280',
                                                        fontSize: 13,
                                                        fontWeight: '600',
                                                        marginBottom: 4
                                                    }}>Tissue:</Text>
                                                    <Text style={{
                                                        color: '#374151',
                                                        fontSize: 14,
                                                        lineHeight: 20
                                                    }}>{analysisResult.visibleBrainCharacteristics.texture}</Text>
                                                </View>
                                            )}
                                            {analysisResult.visibleBrainCharacteristics.borders && (
                                                <View
                                                    style={{backgroundColor: '#f8fafc', padding: 14, borderRadius: 8}}>
                                                    <Text style={{
                                                        color: '#6b7280',
                                                        fontSize: 13,
                                                        fontWeight: '600',
                                                        marginBottom: 4
                                                    }}>Boundaries:</Text>
                                                    <Text style={{
                                                        color: '#374151',
                                                        fontSize: 14,
                                                        lineHeight: 20
                                                    }}>{analysisResult.visibleBrainCharacteristics.borders}</Text></View>
                                            )}
                                            {analysisResult.visibleBrainCharacteristics.distributionPattern && (
                                                <View
                                                    style={{backgroundColor: '#f8fafc', padding: 14, borderRadius: 8}}>
                                                    <Text style={{
                                                        color: '#6b7280',
                                                        fontSize: 13,
                                                        fontWeight: '600',
                                                        marginBottom: 4
                                                    }}>Distribution:</Text>
                                                    <Text style={{
                                                        color: '#374151',
                                                        fontSize: 14,
                                                        lineHeight: 20
                                                    }}>{analysisResult.visibleBrainCharacteristics.distributionPattern}</Text>
                                                </View>
                                            )}
                                            {analysisResult.visibleBrainCharacteristics.inflammation && (
                                                <View
                                                    style={{backgroundColor: '#f8fafc', padding: 14, borderRadius: 8}}>
                                                    <Text style={{
                                                        color: '#6b7280',
                                                        fontSize: 13,
                                                        fontWeight: '600',
                                                        marginBottom: 4
                                                    }}>Inflammation:</Text>
                                                    <Text style={{
                                                        color: '#374151',
                                                        fontSize: 14,
                                                        lineHeight: 20
                                                    }}>{analysisResult.visibleBrainCharacteristics.inflammation}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )}

                                {analysisResult.clarityNote && (
                                    <View style={{
                                        backgroundColor: '#eff6ff',
                                        borderRadius: 12,
                                        padding: 16,
                                        borderLeftWidth: 4,
                                        borderLeftColor: '#3b82f6'
                                    }}>
                                        <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                                            <Ionicons name="information-circle" size={20} color="#3b82f6"
                                                      style={{marginTop: 2}}/>
                                            <Text style={{
                                                color: '#1e40af',
                                                marginLeft: 8,
                                                fontSize: 14,
                                                flex: 1,
                                                lineHeight: 20
                                            }}>
                                                {analysisResult.clarityNote}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {analysisResult.recommendedNextSteps && analysisResult.recommendedNextSteps.length > 0 && (
                                    <View style={{
                                        backgroundColor: 'white',
                                        borderRadius: 16,
                                        padding: 24,
                                        shadowColor: '#000',
                                        shadowOffset: {width: 0, height: 2},
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 5
                                    }}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
                                            <View style={{
                                                backgroundColor: '#d1fae5',
                                                borderRadius: 50,
                                                padding: 8,
                                                marginRight: 12
                                            }}>
                                                <Ionicons name="clipboard-outline" size={24} color="#10b981"/>
                                            </View>
                                            <Text style={{color: '#1f2937', fontWeight: 'bold', fontSize: 18}}>Recommended
                                                Next Steps</Text>
                                        </View>
                                        {analysisResult.recommendedNextSteps.map((step, index) => (
                                            <View key={index} style={{
                                                flexDirection: 'row',
                                                marginBottom: 12,
                                                alignItems: 'flex-start'
                                            }}>
                                                <View style={{
                                                    backgroundColor: '#10b981',
                                                    borderRadius: 50,
                                                    padding: 6,
                                                    marginRight: 12,
                                                    marginTop: 2
                                                }}>
                                                    <Ionicons name="checkmark" size={14} color="white"/>
                                                </View>
                                                <Text style={{color: '#374151', flex: 1, fontSize: 14, lineHeight: 22}}>
                                                    {step}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View style={{
                                    backgroundColor: '#fef3c7',
                                    borderRadius: 16,
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: '#fde68a',
                                    marginBottom: 20
                                }}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                                        <Ionicons name="warning-outline" size={20} color="#f59e0b"/>
                                        <Text style={{color: '#92400e', fontWeight: 'bold', marginLeft: 8}}>Medical
                                            Disclaimer</Text>
                                    </View>
                                    <Text style={{color: '#78350f', fontSize: 14, lineHeight: 20}}>
                                        This AI analysis is for informational and educational purposes only. It should
                                        not replace professional medical diagnosis. Please consult with a qualified
                                        neurologist or healthcare provider for proper evaluation, diagnosis, and
                                        treatment of Alzheimer's Disease or any neurological condition.
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}
export default ImageTab
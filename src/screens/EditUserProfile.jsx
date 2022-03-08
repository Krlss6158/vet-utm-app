import React, { useState, useContext, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SimpleInput, SimpleTitle, SimpleTextArea } from '../components';
import { onlyNumber, nameValidator, emailValidator, phoneValidator, last_nameValidator } from '../core/utils';
import { getProvinces, getCantonsByProvince, updatedDataUser, getParishByCanton } from '../core/utils-http';
import { useToast } from "react-native-toast-notifications";

import AuthContext from "../context/auth/AuthContext";
import { theme } from '../core/theme';

const EditUserProfile = ({ navigation }) => {
    const { user_data, saveUSER } = useContext(AuthContext);
    const toast = useToast();

    const [name, setName] = useState(user_data.name);
    const [last_name, setLastName] = useState(user_data.last_name1 + " " + user_data.last_name2);
    const [email, setEmail] = useState(user_data.email);
    const [phone, setPhone] = useState(user_data.phone);
    const [province_id, setProvince_id] = useState(user_data.province ? user_data.province.id : null);
    const [canton_id, setCanton_id] = useState(user_data.canton ? user_data.canton.id : null);
    const [parish_id, setParish_id] = useState(user_data.parish ? user_data.parish.id : null);


    const [main_street, setMainStreet] = useState(user_data.main_street ? user_data.main_street : null);
    const [street_1_sec, setStreetSec1] = useState(user_data.street_1_sec ? user_data.street_1_sec : null);
    const [street_2_sec, setStreetSec2] = useState(user_data.street_2_sec ? user_data.street_2_sec : null);
    const [address_ref, setAddressRef] = useState(user_data.address_ref ? user_data.address_ref : null);
    //const [address, setAddress] = useState(user_data.address);

    //data api
    const [provinces, setProvinces] = useState();
    const [cantons, setCantons] = useState();
    const [parish, setParish] = useState();

    const [loading, setLoading] = useState(false);
    const [loadingScreen, setLoadingScreen] = useState(true);
    const [msg, setMsg] = useState('');


    const [nameError, setNameError] = useState('');
    const [lastnameError, setLastNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const handleSubmit = async () => {
        Keyboard.dismiss();

        const resn = nameValidator(name);
        const resl = last_nameValidator(last_name);
        const rese = emailValidator(email);
        const resp = phoneValidator(phone);

        setNameError(resn);
        setLastNameError(resl);
        setEmailError(rese);
        setPhoneError(resp);

        if (resn || resl || rese || resp) return;

        setLoading(true);
        var last_name_arr = last_name.split(' ');

        const res = await updatedDataUser({
            name: name, email: email, phone: phone,
            id_canton: canton_id, id_province: province_id, id_parish: parish_id,
            main_street, street_1_sec, street_2_sec, address_ref,
            last_name1: last_name_arr[0],
            last_name2: last_name_arr[1],
        }, user_data.api_token);

        setLoading(false);

        console.log(res.status);
        if (res.status === 404) {
            return toast.show("Usuario no encontrado", { type: 'danger', duration: 4000, offset: 30, animationType: "slide-in" });
        } else if (res.status === 500) {
            return toast.show("Ocurrió un error en el servidor", { type: 'danger', duration: 4000, offset: 30, animationType: "slide-in" });
        } else if (res.status === 401) {
            return toast.show("No estas autorizado para actualizar este perfil", { type: 'danger', duration: 4000, offset: 30, animationType: "slide-in" });
        } else if (res.status === 301) {
            return toast.show(res.data.message, { type: 'danger', duration: 4000, offset: 30, animationType: "slide-in" });
        }
        saveUSER(res.data)
        navigation.navigate('HomeScreen');
        return toast.show("Los datos de tu perfil fueron actualizados", { type: 'success', duration: 4000, offset: 30, animationType: "slide-in" });

    }

    const handleChangeProvince = async (id) => {
        setProvince_id(id);
        const res = await getCantonsByProvince(id);
        if (res !== 500 || res !== 404) {
            setCantons(res.data);
            setCanton_id(res.data[0].id);

            const res1 = await getParishByCanton(res.data[0].id);
            if (res1 !== 500 || res1 !== 404) {
                setParish(res1.data);
                setParish_id(res1.data[0].id);
            }
        }
    }

    const handleChangeCanton = async (id) => {
        setCanton_id(id);
        const res = await getParishByCanton(id);
        if (res !== 500 || res !== 404) {
            setParish(res.data);
            setParish_id(res.data[0].id);
        }
    }

    useEffect(async () => {
        const res = await getProvinces();
        const res1 = await getCantonsByProvince(province_id ? province_id : res.data[0].id);
        const res2 = await getParishByCanton(canton_id ? canton_id : res1.data[0].id);
        setLoadingScreen(false);
        console.log(res1);
        if (res !== 500 || res !== 404) {
            setProvinces(res.data);
            setCantons(res1.data);
            setParish(res2.data);
        }
    }, [])

    return (

        loadingScreen ?
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#333" />
            </View>
            :
            <>
                <ScrollView keyboardShouldPersistTaps='handled' style={{ marginTop: 10 }}>

                    <SimpleTitle title='Nombres' />
                    <SimpleInput
                        placeholder='Nombres'
                        length={30}
                        value={name}
                        error={nameError}
                        onChangeText={text => {
                            setName(text);
                            setNameError('');
                        }}
                    />

                    <SimpleTitle title='Apellidos' />
                    <SimpleInput
                        placeholder='Apellidos'
                        length={30}
                        value={last_name}
                        error={lastnameError}
                        onChangeText={text => {
                            setLastName(text);
                            setLastNameError('');
                        }}
                    />

                    <SimpleTitle title='Correo electrónico' />
                    <SimpleInput
                        placeholder='Correo electrónico'
                        length={65}
                        value={email}
                        error={emailError}
                        onChangeText={text => {
                            setEmail(text);
                            setEmailError('');
                        }}
                    />

                    <SimpleTitle title='Número de telefono' />
                    <SimpleInput
                        placeholder='Número de telefono'
                        length={10}
                        value={phone}
                        error={phoneError}
                        keyboardType='numeric'
                        onChangeText={text => {
                            setPhone(onlyNumber(text));
                            setPhoneError('');
                        }}
                    />

                    <SimpleTitle title='Provincia' />
                    <View style={{ paddingHorizontal: 15 }}>
                        <Picker
                            selectedValue={province_id}
                            style={{ width: '100%', }}
                            onValueChange={(itemValue, itemIndex) => handleChangeProvince(itemValue)}
                        >
                            {
                                provinces ?
                                    provinces.map((e, i) => {
                                        return (
                                            <Picker.Item key={e.id} label={e.name} value={e.id} />
                                        );
                                    })
                                    : null
                            }
                        </Picker>
                    </View>

                    <SimpleTitle title='Canton' />
                    <View style={{ paddingHorizontal: 15 }}>
                        <Picker
                            selectedValue={canton_id}
                            style={{ width: '100%', }}
                            onValueChange={(itemValue, itemIndex) => handleChangeCanton(itemValue)}
                        >
                            {
                                cantons ?
                                    cantons.map((e, i) => {
                                        return (
                                            <Picker.Item key={e.id} label={e.name} value={e.id} />
                                        );
                                    })
                                    : null
                            }
                        </Picker>
                    </View>

                    <SimpleTitle title='Parroquia' />
                    <View style={{ paddingHorizontal: 15 }}>
                        <Picker
                            selectedValue={parish_id}
                            style={{ width: '100%', }}
                            onValueChange={(itemValue, itemIndex) => setParish_id(itemValue)}
                        >
                            {
                                parish ?
                                    parish.map((e, i) => {
                                        return (
                                            <Picker.Item key={e.id} label={e.name} value={e.id} />
                                        );
                                    })
                                    : null
                            }
                        </Picker>
                    </View>

                    <SimpleTitle title='Calle principal' />
                    <SimpleInput
                        placeholder='Calle principal'
                        length={255}
                        value={main_street}
                        numberOfLines={3}
                        onChangeText={text => setMainStreet(text)}
                    />

                    <SimpleTitle title='Calle secundaria 1' />
                    <SimpleInput
                        placeholder='Calle secundaria 1'
                        length={255}
                        value={street_1_sec}
                        numberOfLines={3}
                        onChangeText={text => setStreetSec1(text)}
                    />

                    <SimpleTitle title='Calle secundaria 2' />
                    <SimpleInput
                        placeholder='Calle secundaria 2'
                        length={255}
                        value={street_2_sec}
                        numberOfLines={3}
                        onChangeText={text => setStreetSec2(text)}
                    />

                    <SimpleTitle title='Referencia' />
                    <SimpleTextArea
                        placeholder='Referencia'
                        length={255}
                        value={address_ref}
                        numberOfLines={5}
                        onChangeText={text => setAddressRef(text)}
                    />

                    {msg ? <Text style={{ fontSize: 13, color: 'red', paddingHorizontal: 20 }}>{msg}</Text> : null}


                    <View style={Styles.buttonContainer}>
                        <TouchableOpacity disabled={loading} style={Styles.button} onPress={handleSubmit}>
                            <Text style={Styles.buttonText}>{!loading ? 'GUARDAR' : 'GUARDANDO...'}</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView >
            </>
    );
}

export default EditUserProfile;

const Styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.All,
        padding: 10,
        width: '100%',
        borderRadius: 10
    },
    buttonContainer: {
        paddingHorizontal: 20,
        marginTop: 30,
        marginBottom: 50,
        alignItems: 'center'
    },
    buttonText: {
        color: '#333',
        fontSize: 20,
        textAlign: 'center',
        fontWeight: '700'
    }
});
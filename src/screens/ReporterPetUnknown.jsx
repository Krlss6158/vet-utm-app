import React, { useState, useContext } from "react";
import { Image, View, StyleSheet, Dimensions, TouchableOpacity, Animated, Text, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { deleteItemArr } from '../core/utils';
import { Icon } from 'react-native-elements'
import { createLostPetunknown } from '../core/utils-http';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useToast } from "react-native-toast-notifications";
import AuthContext from '../context/auth/AuthContext';

import { theme } from '../core/theme';
const { width, height } = Dimensions.get('screen');
const DOT_SIZE = 8;
const DOT_SPACING = 8;
const DOT_INDICATOR_SIZE = DOT_SIZE + DOT_SPACING;

const ReporterPetUnknown = ({ navigation }) => {
    let fromdata = new FormData();
    const [images, setImages] = useState([]);
    const [disabled, setDisable] = useState(false);
    const toast = useToast();

    const deleteItem = (item, index) => {
        if (index === images.length - 1) refImage.current.scrollToIndex({ animated: true, index: images.length - 1 })
        setImages(deleteItemArr(images, item));
    };

    const { user_data } = useContext(AuthContext);

    const handleSubmit = async () => {
        setDisable(true);
        refImage.current.scrollToIndex({ Animated: false, index: 0 });
        const res = await createLostPetunknown({ images, user_id: user_data.user_id });
        if (res) {
            toast.show("Las imagenes fueron enviadas a un administrador, las imagenes serán revisadas para ser publicadas.", {
                type: "success",
                placement: "bottom",
                duration: 4000,
                offset: 30,
                animationType: "slide-in"
            });
            setImages([]);
            setDisable(false);
            navigation.navigate('HomeScreen');
        } else {
            toast.show("Al parecer hubo un error de conexión, intentalo más tarde.", {
                type: "danger",
                placement: "bottom",
                duration: 4000,
                offset: 30,
                animationType: "slide-in"
            });
            setDisable(false);
        }
    }


    const selectImage = async () => {

        if (images.length >= 6) return toast.show("Solo se pueden subir 6 fotos!", {
            type: "custom",
            placement: "bottom",
            duration: 4000,
            offset: 30,
            animationType: "slide-in"
        });
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
            allowsMultipleSelection: true,
            base64: true,
            exif: true
        });
        if (!result.cancelled) {
            var arr = result.uri.split('/');
            var namefile = arr[arr.length - 1];
            var arrType = namefile.split('.');
            var type = arrType[arrType.length - 1];
            setImages([...images, { name: namefile, url: result.uri, base64: result.base64, type }]);
        }
    }
    const ScrollX = React.useRef(new Animated.Value(0)).current;
    const refImage = React.useRef('refImage');

    return (
        <View style={Styles.container}>


            {
                !disabled ?
                    <TouchableOpacity onPress={() => { navigation.pop() }}
                        style={{ position: 'absolute', top: height * .02, left: width * .04, zIndex: 1 }} >
                        <Ionicons name='md-arrow-back-sharp' size={25} color='#333' />
                    </TouchableOpacity> : null
            }

            {
                images.length ?
                    <View>
                        <Animated.FlatList
                            data={images}
                            keyExtractor={(item, index) => item.url.toString()}
                            snapToInterval={width}
                            decelerationRate='fast'
                            pagingEnabled={true}
                            legacyImplementation={false}
                            showsHorizontalScrollIndicator={false}
                            horizontal
                            ref={refImage}
                            bounces={false}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { x: ScrollX } } }],
                                { useNativeDriver: true }
                            )}
                            renderItem={({ item, index }) => {
                                return (
                                    <View>
                                        <Image source={{ uri: item.url }} style={Styles.Imageflat} />
                                        <View style={{ position: 'absolute', top: height * .02, right: width * .04, zIndex: 2 }}>
                                            {
                                                !disabled ?
                                                    <TouchableOpacity onPress={() => deleteItem(item.url, index)}>
                                                        <Icon
                                                            name='delete'
                                                            color={theme.colors.error}
                                                            size={20}
                                                        />
                                                    </TouchableOpacity> : null
                                            }
                                        </View>
                                    </View>
                                );
                            }}
                        />
                        {
                            images.length > 1 ?
                                <View style={[Styles.pagination, { left: width / 2 - (images.length * images.length) }]}>
                                    {
                                        images.map((_, index) => {
                                            return (
                                                <Animated.View
                                                    key={index}
                                                    style={Styles.dot} />
                                            );
                                        })
                                    }
                                    <Animated.View style={[Styles.dotIndicator, {
                                        transform: [{
                                            translateX: Animated.divide(ScrollX, width).interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, DOT_INDICATOR_SIZE]
                                            })
                                        }]
                                    }]} />
                                </View> : null
                        }
                    </View> : null
            }



            <View style={[Styles.containerButton, { alignItems: disabled ? 'center' : null, left: disabled ? 0 : 10 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {
                        !disabled ?
                            <TouchableOpacity style={Styles.button} onPress={() => { selectImage() }}>
                                <MaterialIcon name='image-plus' size={25} color='#333' />
                            </TouchableOpacity> : null
                    }

                    {
                        images.length > 0 ?
                            < TouchableOpacity disabled={disabled ? true : false}
                                style={[Styles.buttonSend, { opacity: disabled ? .8 : 1, backgroundColor: disabled ? 'transparent' : theme.colors.All }]}
                                onPress={handleSubmit}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={Styles.text}>
                                        {disabled ? 'Enviando las fotos' : <Ionicons name='ios-send' size={20} color='#333' />}
                                    </Text>
                                    {disabled ? <ActivityIndicator style={{ marginLeft: 5 }} size="small" color="#333" /> : null}
                                </View>
                            </TouchableOpacity> : null
                    }
                </View>
            </View>
        </View >
    );
}

const Styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerButton: {
        width: '100%',
        bottom: 20,
        paddingHorizontal: 20,
        position: 'absolute',
        elevation: 5,
        zIndex: 1
    },
    button: {
        padding: 10,
        borderRadius: 100,
        backgroundColor: theme.colors.All
    },
    buttonSend: {
        marginLeft: 10,
        padding: 10,
        paddingHorizontal: 30,
        borderRadius: 20
    },
    text: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        color: '#333',
        justifyContent: 'center',
        alignItems: 'center'
    },
    Imageflat: {
        width: width,
        height: height,
        resizeMode: 'cover'
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        top: height * .03,
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE,
        backgroundColor: '#333',
        marginRight: DOT_SPACING
    },
    dotIndicator: {
        width: DOT_INDICATOR_SIZE,
        height: DOT_INDICATOR_SIZE,
        backgroundColor: '#333',
        borderRadius: 100,
        position: 'absolute',
        top: -DOT_SIZE / 2,
        left: -DOT_SIZE / 2
    },
});

export default ReporterPetUnknown;
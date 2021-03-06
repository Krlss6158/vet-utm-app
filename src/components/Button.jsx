import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { theme } from '../core/theme';

const Button = ({ mode, style, children, loading, ...props }) => (
    <PaperButton
        disabled={loading ? loading : false}
        style={[styles.button]}
        labelStyle={styles.text}
        mode={mode}
        {...props}
    >
        {children}
    </PaperButton>
);

const styles = StyleSheet.create({
    button: {
        width: '100%',
        marginVertical: 10,
        backgroundColor: theme.colors.All
    },
    text: {
        fontWeight: 'bold',
        fontSize: 15,
        lineHeight: 26,
        color: '#333'
    },
});

export default memo(Button);
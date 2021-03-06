import React from 'react';

import { Text } from 'react-native';

const Value = ({ value, truncate }) => {
    return (
        value ?
            <Text numberOfLines={truncate ? 1 : null}
                style={{
                    textAlign: 'justify',
                    fontSize: 15
                }}>
                {value}
            </Text> : null
    );
}


export default Value;
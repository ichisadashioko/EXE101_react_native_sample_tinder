import { ThemedText } from '@/components/ThemedText';
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router'; // Import useRouter
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutChangeEvent, PanResponder, Pressable, ScrollView, StyleProp, View, ViewStyle } from 'react-native'; // Import Pressable and StyleProp, ViewStyle

// Define types for SwipeCard props
interface SwipeCardProps {
    image_source: any; // You might want to define a more specific type for image_source
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    style?: StyleProp<ViewStyle>; // Use StyleProp<ViewStyle> for style prop
    disabled?: boolean;
    onPress?: () => void; // Add onPress to props
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
    image_source,
    onSwipeLeft,
    onSwipeRight,
    style,
    disabled,
    onPress
}) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const screenWidth = Dimensions.get('window').width;
    const [resetKey, setResetKey] = useState(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disabled,
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (e, gestureState) => {
                if (gestureState.dx > screenWidth / 3) {
                    Animated.spring(pan, {
                        toValue: { x: screenWidth, y: 0 },
                        useNativeDriver: true
                    }).start(() => {
                        pan.setValue({ x: 0, y: 0 });
                        setResetKey(k => k + 1); // force remount
                        onSwipeRight && onSwipeRight();
                    });
                } else if (gestureState.dx < -screenWidth / 3) {
                    Animated.spring(pan, {
                        toValue: { x: -screenWidth, y: 0 },
                        useNativeDriver: true
                    }).start(() => {
                        pan.setValue({ x: 0, y: 0 });
                        setResetKey(k => k + 1); // force remount
                        onSwipeLeft && onSwipeLeft();
                    });
                } else {
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true
                    }).start();
                }
            }
        })
    ).current;

    useEffect(() => {
        pan.setValue({ x: 0, y: 0 });
    }, [resetKey]);

    return (
        <Animated.View
            key={resetKey}
            style={[style, { transform: pan.getTranslateTransform() }]}
            {...(!disabled ? panResponder.panHandlers : {})}
        >
            <Pressable // Wrap content in Pressable
                onPress={onPress} // Pass the onPress prop
                style={{
                    position: 'absolute',
                    top: 0, right: 0,
                    backgroundColor: '#222',
                    borderRadius: 5,
                    padding: 10,
                    zIndex: 1, // Ensure it appears above the image
                }} // Ensure Pressable takes full space
            >
                <ThemedText>details</ThemedText>
            </Pressable>
            <ScrollView
                style={{
                    width: '100%',
                    flex: 1
                }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <View
                    style={{
                        // position: 'absolute',
                        top: 0, left: 0,
                        backgroundColor: 'transparent',
                        width: '100%', height: '90%'
                    }}
                    pointerEvents="none"
                >
                    <ImageBackground
                        pointerEvents="none"
                        source={image_source}
                        style={{ width: '100%', height: '100%' }}
                        contentFit='contain'
                    >
                        <ThemedText
                            pointerEvents="none" >sample text</ThemedText>
                    </ImageBackground>
                </View>
                {/* Add more content here that you want to be scrollable */}
                <View style={{
                    // height: 500,
                    backgroundColor: '#222',
                    // marginTop: '100%'
                }}>
                    <ThemedText>Location: USA</ThemedText>
                    <ThemedText>Age: 25</ThemedText>
                    <ThemedText>Like: Cats</ThemedText>
                    <ThemedText>Dislike: Dogs</ThemedText>
                </View>
            </ScrollView>
        </Animated.View>
    );
}


export default function MatchScreen() {
    const STACK_SIZE = 2;
    const [cards, setCards] = useState([
        require('../../assets/images/wuwa_01.png'),
        require('../../assets/images/wuwa_02.png'),
        require('../../assets/images/wuwa_03.png'),
        require('../../assets/images/wuwa_04.png'),
        require('../../assets/images/wuwa_05.png'),
        // ...more
    ]);

    const router = useRouter(); // Initialize router

    // Move the swiped card to the end of the stack
    const handleSwipe = () => {
        setCards(prev => {
            const [first, ...rest] = prev;
            return [...rest, first];
        });
    };

    const handleCardPress = (cardData: any) => { // Add type for cardData
        // Navigate to the detail screen, passing card data if needed
        // You'll need to replace '/detail-profile' with your actual route
        // and pass appropriate data (e.g., an ID) to identify the profile.
        // router.push({ pathname: '/(tabs)/detail', params: { data: JSON.stringify(cardData) } }); // Updated route
        router.push({ pathname: '/detail', params: { data: JSON.stringify(cardData) } }); // Updated route
    };


    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Only update container size if it actually changes
    const handleLayout = React.useCallback((e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        setContainerSize(prev =>
            prev.width !== width || prev.height !== height ? { width, height } : prev
        );
    }, []);

    return (
        <View
            onLayout={handleLayout}
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {cards.slice(0, STACK_SIZE).reverse().map((card, i) => {
                const isTop = i === STACK_SIZE - 1;
                return (
                    <SwipeCard
                        image_source={card}
                        key={i}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: i,
                            // opacity: 1 - (STACK_SIZE - 1 - i) * 0.15,
                            transform: [{ scale: 1 - (STACK_SIZE - 1 - i) * 0.05 }],
                        }}
                        onSwipeLeft={isTop ? handleSwipe : undefined}
                        onSwipeRight={isTop ? handleSwipe : undefined}
                        disabled={!isTop}
                        onPress={isTop ? () => handleCardPress(card) : undefined} // Pass the press handler
                    />
                );
            })}
        </View>
    );
}
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, View } from 'react-native';

export const SwipeCard = ({ children, onSwipeLeft, onSwipeRight, style, disabled }) => {
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
    }, [children, resetKey]);

    return (
        <Animated.View
            key={resetKey}
            style={[style, { transform: pan.getTranslateTransform() }]}
            {...(!disabled ? panResponder.panHandlers : {})}
        >
            <View>{children}</View>
        </Animated.View>
    );
}

export function DynamicImage({
    source, style,
    container_size = { width: 512, height: 512 },
    // on_container_size_change
}) {
    const [imageSize, setImageSize] = useState({
        real_width: 0,
        real_height: 0,
        width: 512,
        height: 512,
        updated: false
    });

    let internal_source = null;

    if (typeof source === 'object' && source.uri && source.width && source.height) {
        internal_source = source;
    } else if (typeof source === 'string') {
        internal_source = { uri: source };
    } else {
        console.error('Invalid source type for DynamicImage:', source);
        return null;
    }

    function set_image_render_size(
        width: number,
        height: number,
        container_size: { width: number, height: number } = { width: 512, height: 512 }
    ) {
        console.log('Calculating image size...');
        // const window_size = Dimensions.get('window');
        const resize_factor = Math.min(container_size.width / width, container_size.height / height);
        const newWidth = width * resize_factor;
        const newHeight = height * resize_factor;
        console.log(`New size: ${newWidth}x${newHeight}`);
        setImageSize({
            real_width: width,
            real_height: height,
            width: newWidth, height: newHeight, updated: true
        });
    }

    useEffect(() => {
        console.log('image_source:', internal_source);
        if (typeof internal_source === 'number') {
            // local image
            const { width, height } = Image.resolveAssetSource(internal_source);
            set_image_render_size(width, height, container_size);
        } else if (internal_source.width && internal_source.height) {
            // already has width and height
            console.log('Image already has dimensions:', internal_source.width, internal_source.height);
            set_image_render_size(internal_source.width, internal_source.height, container_size);
        }
        else {
            // remote image
            Image.getSize(internal_source.uri, (width, height) => {
                set_image_render_size(width, height, container_size);
            }, (error) => {
                console.error('Error getting image size:', error);
            });
        }
    }, [internal_source, container_size]);

    return (
        <Image
            source={internal_source}
            style={{ width: imageSize.width, height: imageSize.height }}
            resizeMode='contain'
        />
    );
}

// Memoized DynamicImage to avoid unnecessary re-renders
const MemoizedDynamicImage = React.memo(DynamicImage);

export default function MatchScreen() {
    const STACK_SIZE = 3;
    const [cards, setCards] = useState([
        require('../../assets/images/wuwa_01.png'),
        require('../../assets/images/wuwa_02.png'),
        require('../../assets/images/wuwa_03.png'),
        require('../../assets/images/wuwa_04.png'),
        require('../../assets/images/wuwa_05.png'),
        // ...more
    ]);

    // Move the swiped card to the end of the stack
    const handleSwipe = () => {
        setCards(prev => {
            const [first, ...rest] = prev;
            return [...rest, first];
        });
    };

    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Only update container size if it actually changes
    const handleLayout = React.useCallback((e) => {
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
                        key={i}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: i,
                            opacity: 1 - (STACK_SIZE - 1 - i) * 0.15,
                            transform: [{ scale: 1 - (STACK_SIZE - 1 - i) * 0.05 }],
                        }}
                        onSwipeLeft={isTop ? handleSwipe : undefined}
                        onSwipeRight={isTop ? handleSwipe : undefined}
                        disabled={!isTop}
                    >
                        <MemoizedDynamicImage
                            container_size={containerSize}
                            source={card}
                            style={{ flex: 1, width: '100%', height: '100%' }}
                        />
                    </SwipeCard>
                );
            })}
        </View>
    );
}
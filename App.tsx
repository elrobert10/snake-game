// Genera un color hexadecimal aleatorio
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const BOARD_SIZE = 15;
const CELL_SIZE = Math.floor(Dimensions.get('window').width / BOARD_SIZE);
const INITIAL_SNAKE = [
  { x: 7, y: 7 },
];
const INITIAL_DIRECTION = 'RIGHT';

function getRandomFood(snake: {x:number,y:number}[]): {x:number, y:number} {
  let food: {x:number, y:number};
  while (true) {
    food = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    if (!snake.some(seg => seg.x === food.x && seg.y === food.y)) break;
  }
  return food;
}

export default function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFood(INITIAL_SNAKE));
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [snakeColor, setSnakeColor] = useState(getRandomColor());
  const moveRef = useRef(direction);

  useEffect(() => {
    moveRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        let newHead;
        switch (moveRef.current) {
          case 'UP': newHead = { x: head.x, y: head.y - 1 }; break;
          case 'DOWN': newHead = { x: head.x, y: head.y + 1 }; break;
          case 'LEFT': newHead = { x: head.x - 1, y: head.y }; break;
          case 'RIGHT': newHead = { x: head.x + 1, y: head.y }; break;
          default: newHead = head;
        }
        // Check collision
        if (
          newHead.x < 0 || newHead.x >= BOARD_SIZE ||
          newHead.y < 0 || newHead.y >= BOARD_SIZE ||
          prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setGameOver(true);
          return prevSnake;
        }
        let newSnake = [newHead, ...prevSnake];
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(getRandomFood(newSnake));
          setScore(s => s + 1);
            setSnakeColor(getRandomColor());
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [food, gameOver]);

  const handleDirection = (dir: string) => {
    // Prevent reverse
    if (
      (dir === 'UP' && direction === 'DOWN') ||
      (dir === 'DOWN' && direction === 'UP') ||
      (dir === 'LEFT' && direction === 'RIGHT') ||
      (dir === 'RIGHT' && direction === 'LEFT')
    ) return;
    setDirection(dir);
  };

  const panGesture = Gesture.Pan()
  .onEnd((event: any) => {
    const { translationX, translationY } = event;
    if (Math.abs(translationX) > Math.abs(translationY)) {
      if (translationX > 0) handleDirection('RIGHT');
      else handleDirection('LEFT');
    } else {
      if (translationY > 0) handleDirection('DOWN');
      else handleDirection('UP');
    }
  });

  const handleRestart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setSnakeColor(getRandomColor());
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          <Text style={styles.title}>Snake Game</Text>
          <Text style={styles.score}>Score: {score}</Text>
          <View style={styles.board}>
            {Array.from({ length: BOARD_SIZE }).map((_, y) => (
              <View key={y} style={{ flexDirection: 'row' }}>
                {Array.from({ length: BOARD_SIZE }).map((_, x) => {
                  const isSnake = snake.some(seg => seg.x === x && seg.y === y);
                  const isHead = snake[0].x === x && snake[0].y === y;
                  const isFood = food.x === x && food.y === y;
                  return (
                    <View
                      key={x}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: isHead
                          ? snakeColor
                          : isSnake
                          ? snakeColor
                          : isFood
                          ? '#ff4136'
                          : '#eee',
                        borderWidth: 1,
                        borderColor: '#fff',
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
          {gameOver && (
            <View style={styles.overlay}>
              <Text style={styles.gameOver}>Game Over</Text>
              <View style={styles.restartBtn}>
                <Text style={{ color: '#fff' }} onPress={handleRestart}>Restart</Text>
              </View>
            </View>
          )}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  score: {
    fontSize: 18,
    marginBottom: 10,
  },
  board: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#01a89e',
    marginBottom: 20,
  },
  // ...existing code...
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOver: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ff4136',
    marginBottom: 20,
  },
  restartBtn: {
    backgroundColor: '#01a89e',
    padding: 16,
    borderRadius: 8,
  },
});

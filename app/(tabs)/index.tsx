import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const CARD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8];

const CARD_COLORS: Record<number, string> = {
  1: '#ff6b6b',
  2: '#ffd93d',
  3: '#6bcb77',
  4: '#4d96ff',
  5: '#ff922b',
  6: '#cc5de8',
  7: '#20c997',
  8: '#f06595',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface CardState {
  id: number;
  value: number;
  flipped: boolean;
  matched: boolean;
  revealCount: number;
}

function initCards(): CardState[] {
  return shuffle(CARD_VALUES).map((value, id) => ({
    id,
    value,
    flipped: false,
    matched: false,
    revealCount: 0,
  }));
}

export default function MemoryGame() {
  const [cards, setCards] = useState<CardState[]>(initCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setGameWon(true);
    }
  }, [cards]);

  useEffect(() => {
    if (selected.length !== 2) return;

    setDisabled(true);
    setMoves((m) => m + 1);

    const [a, b] = selected;
    const cardA = cards[a];
    const cardB = cards[b];

    if (cardA.value === cardB.value) {
      // +20 on match, no cap — works even if score is negative
      setScore((s) => s + 20);
      setCards((prev) =>
        prev.map((c) =>
          c.id === a || c.id === b ? { ...c, matched: true, flipped: true } : c
        )
      );
      setSelected([]);
      setDisabled(false);
    } else {
      // -1 on mismatch, can go negative
      setScore((s) => s - 1);
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === a || c.id === b ? { ...c, flipped: false } : c
          )
        );
        setSelected([]);
        setDisabled(false);
      }, 900);
    }
  }, [selected]);

  function handleCardPress(id: number) {
    if (disabled) return;
    const card = cards[id];
    if (card.flipped || card.matched || selected.includes(id)) return;
    if (selected.length >= 2) return;

    setCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, flipped: true, revealCount: c.revealCount + 1 } : c
      )
    );
    setSelected((prev) => [...prev, id]);
  }

  function resetGame() {
    setCards(initCards());
    setSelected([]);
    setScore(0);
    setMoves(0);
    setDisabled(false);
    setGameWon(false);
  }

  const matched = cards.filter((c) => c.matched).length / 2;

  return (
    <SafeAreaView style={styles.container}>
      {/* Background decorative circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Text style={styles.title}>Memory Card Game</Text>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={[styles.statValue, score < 0 && styles.statValueNegative]}>{score}</Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👆</Text>
          <Text style={styles.statValue}>{moves}</Text>
          <Text style={styles.statLabel}>Moves</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statValue}>{matched}/8</Text>
          <Text style={styles.statLabel}>Matched</Text>
        </View>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.matched
                ? styles.cardMatched
                : card.flipped
                ? styles.cardFlipped
                : styles.cardHidden,
            ]}
            onPress={() => handleCardPress(card.id)}
            disabled={disabled || card.matched || card.flipped}
            activeOpacity={0.75}
          >
            {card.flipped || card.matched ? (
              <Text style={[styles.cardText, { color: CARD_COLORS[card.value] }]}>
                {card.value}
              </Text>
            ) : (
              <Text style={styles.cardBack}>?</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Win overlay */}
      {gameWon && (
        <View style={styles.winOverlay}>
          <Text style={styles.winEmoji}>🎉</Text>
          <Text style={styles.winTitle}>Congratulations!</Text>
          <Text style={styles.winSub}>
            You matched all cards in {moves} moves with a score of {score}!
          </Text>
          <TouchableOpacity style={styles.restartBtn} onPress={resetGame}>
            <Text style={styles.restartText}>🔄  Restart Game</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6ec',
    alignItems: 'center',
    paddingTop: 16,
    overflow: 'hidden',
  },
  // decorative background blobs
  bgCircle1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#fde8cc',
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#fce4d6',
    bottom: 40,
    left: -80,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3d2c1e',
    marginBottom: 16,
    letterSpacing: 0.4,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#c97b3a',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 64,
  },
  statValueNegative: {
    color: '#e03131',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#f0dcc8',
    marginHorizontal: 12,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3d2c1e',
  },
  statLabel: {
    fontSize: 11,
    color: '#a07850',
    marginTop: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 320,
    gap: 10,
    justifyContent: 'center',
  },
  card: {
    width: 68,
    height: 68,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHidden: {
    backgroundColor: '#f4a261',
    shadowColor: '#c97b3a',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  cardFlipped: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f4a261',
    shadowColor: '#f4a261',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardMatched: {
    backgroundColor: '#d3f9d8',
    borderWidth: 2,
    borderColor: '#6bcb77',
  },
  cardText: {
    fontSize: 32,
    fontWeight: '800',
  },
  cardBack: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  winOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#c97b3a',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  winEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  winTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3d2c1e',
    marginBottom: 6,
  },
  winSub: {
    fontSize: 14,
    color: '#a07850',
    textAlign: 'center',
    marginBottom: 20,
  },
  restartBtn: {
    backgroundColor: '#f4a261',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 36,
  },
  restartText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

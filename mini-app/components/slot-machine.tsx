"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";
import { cn } from "@/lib/utils";

const fruits = ["apple", "banana", "cherry", "lemon"] as const;
type Fruit = typeof fruits[number];

const getRandomFruit = (): Fruit => fruits[Math.floor(Math.random() * fruits.length)];

export default function SlotMachine() {
  const [grid, setGrid] = useState<Fruit[][]>(Array.from({ length: 3 }, () => Array.from({ length: 3 }, getRandomFruit)));
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWin(null);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      setGrid(prev => {
        const newGrid = prev.map(row => [...row]);
        // shift each column down
        for (let col = 0; col < 3; col++) {
          const newCol = [getRandomFruit(), ...newGrid.slice(0, 2).map(row => row[col])];
          for (let row = 0; row < 3; row++) {
            newGrid[row][col] = newCol[row];
          }
        }
        return newGrid;
      });
      if (Date.now() - start > 2000) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setSpinning(false);
        checkWin();
      }
    }, 100);
  };

  const checkWin = () => {
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (grid[row][0] === grid[row][1] && grid[row][1] === grid[row][2]) {
        setWin(`You won with ${grid[row][0]}!`);
        return;
      }
    }
    // Check columns
    for (let col = 0; col < 3; col++) {
      if (grid[0][col] === grid[1][col] && grid[1][col] === grid[2][col]) {
        setWin(`You won with ${grid[0][col]}!`);
        return;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2">
        {grid.flat().map((fruit, idx) => (
          <div key={idx} className="w-20 h-20 flex items-center justify-center border rounded">
            <img src={`/${fruit}.png`} alt={fruit} className="w-16 h-16" />
          </div>
        ))}
      </div>
      <Button onClick={spin} disabled={spinning} variant="outline">
        {spinning ? "Spinning..." : "Spin"}
      </Button>
      {win && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-bold">{win}</span>
          <Share text={`${win} ${url}`} />
        </div>
      )}
    </div>
  );
}

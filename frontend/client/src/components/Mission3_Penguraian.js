import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- Reusable Sortable Item ---
function SortableItem({ id, content }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="dnd-item">
      {content}
    </div>
  );
}

// --- Draggable Overlay Item ---
function DraggableItem({ content }) {
  return <div className="dnd-item-overlay">{content}</div>;
}

// --- Droppable Column ---
function DroppableSortableColumn({ id, title, items }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`dnd-column ${id === 'available' ? 'available' : ''}`}>
      <h4>{title.toUpperCase()}</h4>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {items.map(item => (
          <SortableItem key={item.id} id={item.id} content={item.content} />
        ))}
      </SortableContext>
    </div>
  );
}

// --- Initial Items for "Student Fees" Scenario ---
const INITIAL_ITEMS = {
  available: [
    { id: 'item-1', content: 'Tentukan Status Bayaran (Lunas / Belum Lunas)' },
    { id: 'item-2', content: 'Jenis Yuran (Pengajian, Asrama, Aktiviti)' },
    { id: 'item-3', content: 'Kira Jumlah Yuran – Jumlah Bayaran' },
    { id: 'item-4', content: 'Cetak Resit Pembayaran' },
    { id: 'item-5', content: 'Jumlah Bayaran' },
    { id: 'item-6', content: 'No Pendaftaran' },
    { id: 'item-7', content: 'Papar Baki Yuran' },
    { id: 'item-8', content: 'Jumlah Yuran' },
    { id: 'item-9', content: 'Status Bayaran (Lunas/Belum Lunas)' },
    { id: 'item-10', content: 'Ulang setiap pelajar' },
    { id: 'item-11', content: 'Kaedah Bayaran (FPX / Tunai)' },
  ],
  input: [],
  proses: [],
  output: [],
};

const clone = (obj) => JSON.parse(JSON.stringify(obj));

// --- Mission 3 Penguraian ---
function Mission3_Penguraian({ onContinue, setRobotText, onFeedback, isCorrect: propIsCorrect }) {
  const [items, setItems] = useState(clone(INITIAL_ITEMS));
  const [activeId, setActiveId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Scoring State
  const [earnedScore, setEarnedScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (setRobotText) {
        setRobotText('Kenal pasti Input, Proses, dan Output untuk sistem yuran pelajar.');
    }
  }, [setRobotText]);

  const findContainer = (itemId) => {
    if (!itemId) return null;
    for (const container of Object.keys(items)) {
      if (items[container].find(i => i.id === itemId)) return container;
    }
    return null;
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) { setActiveId(null); return; }
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id;
    if (!activeContainer || !overContainer) { setActiveId(null); return; }

    // Reset correctness state on any drag
    setIsCorrect(false);

    if (activeContainer === overContainer) {
      setItems(prev => {
        const list = [...prev[activeContainer]];
        const from = list.findIndex(i => i.id === active.id);
        const to = list.findIndex(i => i.id === over.id);
        if (from === -1 || to === -1) return prev;
        return { ...prev, [activeContainer]: arrayMove(list, from, to) };
      });
    } else {
      setItems(prev => {
        const source = [...prev[activeContainer]];
        const target = [...prev[overContainer]];
        const moved = source.find(i => i.id === active.id);
        if (!moved) return prev;
        const newSource = source.filter(i => i.id !== active.id);
        const overIndex = target.findIndex(i => i.id === over.id);
        if (overIndex === -1) target.push(moved);
        else target.splice(overIndex, 0, moved);
        return { ...prev, [activeContainer]: newSource, [overContainer]: target };
      });
    }

    setActiveId(null);
  };

  // --- CHECK Answer & SCORE ---
  const checkAnswer = async () => {
    // Correct answers for Student Fees
    const correctInput = ['item-6','item-2','item-8','item-5','item-11'].sort();
    const correctProses = ['item-3','item-1','item-10'].sort();
    const correctOutput = ['item-7','item-9','item-4'].sort();

    const playerInput = items.input.map(i => i.id).sort();
    const playerProses = items.proses.map(i => i.id).sort();
    const playerOutput = items.output.map(i => i.id).sort();

    const ok = 
      JSON.stringify(playerInput) === JSON.stringify(correctInput) &&
      JSON.stringify(playerProses) === JSON.stringify(correctProses) &&
      JSON.stringify(playerOutput) === JSON.stringify(correctOutput);

    if (!ok) {
        setAttempts(prev => prev + 1);
        setIsCorrect(false);
        if (onFeedback) onFeedback('⚠️ Semak semula. Semua data pelajar seperti nombor pendaftaran adalah Input. (-5 Markah)', 3000, false);
        return;
    }

    // Correct: Calculate Score
    const calculatedScore = Math.max(5, 25 - (attempts * 5));
    
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://algoquest-api.onrender.com/api/mission/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          mission: 3,
          phase: 'penguraian',
          isCorrect: true,
          score: calculatedScore,
          badge: null
        })
      });

      setEarnedScore(calculatedScore);
      setIsCorrect(true);
      if (onFeedback) onFeedback(`✅ Bagus! Anda telah mengenal pasti komponen utama sistem kewangan. (+${calculatedScore} Markah)`, 3000, true);
      
    } catch (err) {
      console.error("Error submitting:", err);
      if (onFeedback) onFeedback('⚠️ Ralat menghubungi pelayan.', 3000, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setItems(clone(INITIAL_ITEMS));
    setActiveId(null);
    setIsCorrect(false);
    setAttempts(0);
    if (onFeedback) onFeedback('Susunan telah direset. Cuba semula dengan teliti.', 2000, null);
  };

  const handleNext = () => {
    if (!isCorrect) return;
    onContinue(earnedScore);
  };

  const activeItem = activeId
    ? [...items.available, ...items.input, ...items.proses, ...items.output].find(i => i.id === activeId)
    : null;

  return (
    <div>
      <h3>TAHAP 1: PENGURAIAN</h3>
      <p>
        Dalam Sistem Kewangan Kampus Digital, setiap pelajar perlu membayar beberapa jenis yuran seperti pengajian, asrama dan aktiviti pelajar. Robot Algo sedang membina modul pengiraan automatik untuk menjumlahkan semua jenis yuran Tugas anda ialah  mengenal pasti bahagian input, proses dan output dalam sistem ulangan ini supaya sistem dapat mengira jumlah keseluruhan dengan betul.

      </p>
      <hr />
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="dnd-container">
          {Object.keys(items).map(id => (
            <DroppableSortableColumn key={id} id={id} title={id === 'available' ? 'Item Tersedia' : id} items={items[id]} />
          ))}
        </div>
        <DragOverlay>
          {activeItem && <DraggableItem content={activeItem.content} />}
        </DragOverlay>
      </DndContext>
      <hr />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
        <button
          onClick={handleReset}
          className="primary-button"
          disabled={isSubmitting}
        >
          Buat Semula
        </button>

        <button
          onClick={checkAnswer}
          className="primary-button"
          disabled={isSubmitting}
        >
          Semak Jawapan
        </button>

        <button
          onClick={isCorrect ? handleNext : undefined}
          className="primary-button"
          style={{
            backgroundColor: isCorrect ? '#2ecc71' : '#999',
            cursor: isCorrect ? 'pointer' : 'not-allowed',
          }}
          disabled={!isCorrect}
        >
          Seterusnya
        </button>
      </div>
    </div>
  );
}

export default Mission3_Penguraian;
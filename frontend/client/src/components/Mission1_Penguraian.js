import React, { useState } from 'react';
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="dnd-item"
    >
      {content}
    </div>
  );
}

// --- Overlay Draggable Item ---
function DraggableItem({ content }) {
  return <div className="dnd-item-overlay">{content}</div>;
}

// --- Droppable Column ---
function DroppableSortableColumn({ id, title, items }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`dnd-column ${id}`}>
      <h4>{title}</h4>

      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {items.map(item => (
          <SortableItem key={item.id} id={item.id} content={item.content} />
        ))}
      </SortableContext>
    </div>
  );
}

const INITIAL = {
  available: [
    { id: 'i1', content: 'Nama Pelajar' },
    { id: 'i2', content: 'No Pendaftaran' },
    { id: 'i3', content: 'Program' },
    { id: 'i4', content: 'Kursus' },
    { id: 'i5', content: 'Cetak Slip Pendaftaran' },
    { id: 'i6', content: 'Daftar kursus' },
    { id: 'i7', content: 'Semester' }
  ],
  input: [],
  proses: [],
  output: []
};

const clone = obj => JSON.parse(JSON.stringify(obj));

function Mission1_Penguraian({ onContinue, onFeedback }) {
  const [items, setItems] = useState(clone(INITIAL));
  const [activeId, setActiveId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Scoring State
  const [earnedScore, setEarnedScore] = useState(0);
  const [attempts, setAttempts] = useState(0); // Tracks how many times user got it wrong
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- find container of item ---
  const findContainer = id => {
    for (const key in items) {
      if (items[key].find(i => i.id === id)) return key;
    }
    return null;
  };

  // --- Drag events ---
  const handleDragStart = e => setActiveId(e.active.id);

  const handleDragEnd = e => {
    const { active, over } = e;
    if (!over) return setActiveId(null);

    const from = findContainer(active.id);
    const to = findContainer(over.id) || over.id;

    if (!from || !to) return;

    // Reset correct state if user moves items after checking
    setIsCorrect(false); 

    if (from === to) {
      // reorder
      setItems(prev => {
        const list = [...prev[from]];
        const fromIndex = list.findIndex(i => i.id === active.id);
        const toIndex = list.findIndex(i => i.id === over.id);
        return {
          ...prev,
          [from]: arrayMove(list, fromIndex, toIndex)
        };
      });
    } else {
      // move between lists
      setItems(prev => {
        const source = [...prev[from]];
        const target = [...prev[to]];
        const moving = source.find(i => i.id === active.id);

        return {
          ...prev,
          [from]: source.filter(i => i.id !== active.id),
          [to]: [...target, moving]
        };
      });
    }

    setActiveId(null);
  };

  // --- CHECK Answer & SCORING ---
  const checkAnswer = async () => {
    const correct = {
      input: ['i1', 'i2', 'i3', 'i4', 'i7'],
      proses: ['i6'],
      output: ['i5']
    };

    // 1. Calculate correctness locally
    const ok =
      JSON.stringify(items.input.map(i => i.id).sort()) === JSON.stringify(correct.input.sort()) &&
      JSON.stringify(items.proses.map(i => i.id).sort()) === JSON.stringify(correct.proses.sort()) &&
      JSON.stringify(items.output.map(i => i.id).sort()) === JSON.stringify(correct.output.sort());

    if (ok) {
        // Correct Logic: Start at 25, deduct 5 per attempt, min 5
        const finalScore = Math.max(5, 25 - (attempts * 5));
        setEarnedScore(finalScore);
        setIsCorrect(true);

        // FIX: Pass 'success' string for Green Glow
        onFeedback(`🎉 Hebat! Semua komponen betul! (+${finalScore} Markah)`, 3000, 'success'); 
    } else {
        // Incorrect Logic
        setAttempts(prev => prev + 1);
        setIsCorrect(false);

        // FIX: Pass 'error' string for Red Glow
        onFeedback('😅 Masih ada komponen yang tersilap! (-5 Markah)', 3000, 'error'); 
    }
  };

  // --- RESET ---
  const handleReset = () => {
    setItems(clone(INITIAL));
    setIsCorrect(false);
    setAttempts(0); // FIX: Reset attempts so score goes back to 25
    onFeedback('🔄 Reset berjaya. Markah kembali penuh.', 2000, 'neutral');
  };

  // --- SUBMIT TO BACKEND ---
  const handleNext = async () => {
     if (!isCorrect) return;
     
     setIsSubmitting(true);
     const token = localStorage.getItem('token');
     
     try {
        await fetch('https://algoquest-api.onrender.com/api/mission/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          mission: 1,
          phase: 'penguraian',
          isCorrect: true,
          score: earnedScore, // Send the locally calculated score
          badge: null
        })
      });
      
      // Move to next phase
      onContinue(earnedScore);

     } catch (err) {
         console.error("Error submitting:", err);
     } finally {
         setIsSubmitting(false);
     }
  };

  const activeItem =
    activeId &&
    [...items.available, ...items.input, ...items.proses, ...items.output].find(
      i => i.id === activeId
    );

  return (
    <div>
      <h3>TAHAP 1: PENGURAIAN</h3>
      <p>Sistem Akademik sedang membina modul pendaftaran pelajar baharu. Namun, sistem masih belum dapat mengenal pasti komponen Input, Proses dan Output dengan betul. Tugas anda ialah memecahkan masalah kepada tiga komponen utama dan meletakkan setiap item pada kedudukan yang betul supaya aliran pendaftaran berjalan lancar.</p>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="dnd-container">
          <DroppableSortableColumn id="available" title="Item Tersedia" items={items.available} />
          <DroppableSortableColumn id="input" title="Input" items={items.input} />
          <DroppableSortableColumn id="proses" title="Proses" items={items.proses} />
          <DroppableSortableColumn id="output" title="Output" items={items.output} />
        </div>

        <DragOverlay>
          {activeItem ? <DraggableItem content={activeItem.content} /> : null}
        </DragOverlay>
      </DndContext>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button className="primary-button" onClick={handleReset} disabled={isSubmitting}>
          Buat Semula
        </button>

        <button className="primary-button" onClick={checkAnswer} disabled={isSubmitting || isCorrect}>
          {isCorrect ? 'Betul!' : 'Semak'}
        </button>

        <button
          className="primary-button"
          style={{
            backgroundColor: isCorrect ? '#2ecc71' : '#999',
            cursor: isCorrect ? 'pointer' : 'not-allowed'
          }}
          disabled={!isCorrect || isSubmitting}
          onClick={handleNext}
        >
          {isSubmitting ? 'Menghantar...' : 'Seterusnya'}
        </button>
      </div>
    </div>
  );
}

export default Mission1_Penguraian;
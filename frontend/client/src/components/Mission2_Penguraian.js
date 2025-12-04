import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- Reusable Sortable Item ---
function SortableItem({ id, content }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="dnd-item">
      {content}
    </div>
  );
}

// --- Reusable Draggable Item (for the overlay) ---
function DraggableItem({ id, content }) {
  return <div className="dnd-item-overlay">{content}</div>;
}

// --- Reusable Droppable Column ---
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

// --- Main Component ---
function Mission2_Penguraian({ onContinue, onFeedback }) {
  const [items, setItems] = useState({
    available: [
      { id: 'item-1', content: 'Kira Markah Keseluruhan' },
      { id: 'item-2', content: 'Markah PA' },
      { id: 'item-3', content: 'Tentukan Gred' },
      { id: 'item-4', content: 'Gred Huruf' },
      { id: 'item-5', content: 'Kehadiran (%)' }, // Fixed from 'No Pendaftaran' to match correct logic
      { id: 'item-6', content: 'Semak Syarat Lulus' },
      { id: 'item-7', content: 'Status Lulus' },
      { id: 'item-8', content: 'Markah PB' },
    ],
    input: [],
    proses: [],
    output: [],
  });

  const [activeId, setActiveId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Backend Integration State
  const [earnedScore, setEarnedScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function findContainer(itemId) {
    if (!itemId) return null;
    if (Object.keys(items).includes(itemId)) return itemId;
    for (const container of Object.keys(items)) {
      if (items[container].find(item => item.id === itemId)) return container;
    }
    return null;
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || !items[activeContainer] || !items[overContainer]) {
      setActiveId(null);
      return;
    }
    
    // Reset correct state if user moves items after checking
    setIsCorrect(false);

    if (activeContainer !== overContainer) {
      setItems(prev => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer];
        const activeIndex = activeItems.findIndex(item => item.id === active.id);
        const [movedItem] = activeItems.splice(activeIndex, 1);

        const overItem = overItems.find(item => item.id === over.id);
        const overIndex = overItem ? overItems.findIndex(item => item.id === over.id) : overItems.length;

        overItems.splice(overIndex, 0, movedItem);

        return {
          ...prev,
          [activeContainer]: [...activeItems],
          [overContainer]: [...overItems],
        };
      });
    } else {
      setItems(prev => {
        const activeItems = prev[activeContainer];
        const activeIndex = activeItems.findIndex(item => item.id === active.id);
        const overIndex = activeItems.findIndex(item => item.id === over.id);
        return {
          ...prev,
          [activeContainer]: arrayMove(activeItems, activeIndex, overIndex),
        };
      });
    }
    setActiveId(null);
  }

  // ✅ Updated to use Backend Scoring
  const checkAnswer = async () => {
    const correctInput = ['item-2', 'item-5', 'item-8'].sort();
    const correctProses = ['item-1', 'item-3', 'item-6'].sort();
    const correctOutput = ['item-4', 'item-7'].sort();

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
        onFeedback('❌ Hmm, semak semula. (-5 Markah)', 3000, false); // Red Glow 'false'
        return;
    }

    // Correct: Calculate Score
    const calculatedScore = Math.max(5, 25 - (attempts * 5));

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
          mission: 2,
          phase: 'penguraian',
          isCorrect: true,
          score: calculatedScore,
          badge: null
        })
      });

      setEarnedScore(calculatedScore);
      setIsCorrect(true);
      // Green Glow 'true'
      onFeedback(`✅ Hebat! Anda telah mengenal pasti input, proses dan output dengan betul. (+${calculatedScore} Markah)`, 3000, true);

    } catch (err) {
      console.error("Error submitting:", err);
      onFeedback('⚠️ Ralat menghubungi pelayan.', 3000, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setItems({
      available: [
        { id: 'item-1', content: 'Kira Markah Keseluruhan' },
        { id: 'item-2', content: 'Markah PA' },
        { id: 'item-3', content: 'Tentukan Gred' },
        { id: 'item-4', content: 'Gred Huruf' },
        { id: 'item-5', content: 'No Pendaftaran' },
        { id: 'item-6', content: 'Semak Syarat Lulus' },
        { id: 'item-7', content: 'Status Lulus' },
        { id: 'item-8', content: 'Markah PB' },
      ],
      input: [],
      proses: [],
      output: [],
    });
    setIsCorrect(false);
    setAttempts(0); // Reset attempts
    onFeedback('🔄 Susunan telah direset. Cuba semula.', 2000, null);
  };

  const handleNext = () => {
    if (!isCorrect) return;
    onContinue(earnedScore); // Pass earned score
  };

  const activeItem = activeId ? [...items.available, ...items.input, ...items.proses, ...items.output].find(i => i.id === activeId) : null;

  return (
    <div>
      <h3>TAHAP 1: PENGURAIAN</h3>
      <p>Sistem Peperiksaan sedang dibangunkan untuk menilai keputusan pelajar secara automatik. <br />Tugas anda ialah mengenal pasti data input, langkah proses dan hasil output supaya sistem dapat berfungsi dengan betul.</p>

      <hr />
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="dnd-container">
          {Object.keys(items).map(containerId => (
            <DroppableSortableColumn
              key={containerId}
              id={containerId}
              title={containerId === 'available' ? 'Item Tersedia' : containerId}
              items={items[containerId]}
            />
          ))}
        </div>
        <DragOverlay>
          {activeItem && <DraggableItem id={activeItem.id} content={activeItem.content} />}
        </DragOverlay>
      </DndContext>
      <hr />

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button className="primary-button" onClick={reset} disabled={isSubmitting}>
          Buat Semula
        </button>

        <button className="primary-button" onClick={checkAnswer} disabled={isSubmitting}>
          {isSubmitting ? 'Menghantar...' : 'Semak Jawapan'}
        </button>

        <button
          className="primary-button"
          style={{
            backgroundColor: isCorrect ? '#2ecc71' : '#999',
            cursor: isCorrect ? 'pointer' : 'not-allowed',
          }}
          disabled={!isCorrect}
          onClick={isCorrect ? handleNext : undefined}
        >
          Seterusnya
        </button>
      </div>
    </div>
  );
}

export default Mission2_Penguraian;
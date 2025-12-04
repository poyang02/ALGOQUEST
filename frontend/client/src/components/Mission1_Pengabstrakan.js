import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
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

// --- Reusable Draggable Item (for the overlay) ---
function DraggableItem({ id, content }) {
  return (
    <div className="dnd-item-overlay">
      {content}
    </div>
  );
}

// --- Reusable Droppable Column (using new class) ---
function DroppableSortableColumn({ id, title, items }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`dnd-column-split ${id.startsWith('available') ? 'available' : ''}`}
    >
      <h4>{title.toUpperCase()}</h4>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {items.map(item => (
          <SortableItem key={item.id} id={item.id} content={item.content} />
        ))}
      </SortableContext>
    </div>
  );
}

// --- Initial states so BUAT SEMULA can reset cleanly ---
const INITIAL_MAKLUMAT = {
  available: [
    { id: 'm-1', content: 'Nama Pelajar' },
    { id: 'm-2', content: 'No Telefon' },
    { id: 'm-3', content: 'Semester' },
    { id: 'm-4', content: 'Alamat' },
    { id: 'm-5', content: 'Program' },
    { id: 'm-6', content: 'Masa' },
    { id: 'm-7', content: 'Kursus' },
    { id: 'm-8', content: 'No Pendaftaran' },
  ],
  penting: [],
};

const INITIAL_LANGKAH = {
  available_langkah: [
    { id: 'l-1', content: 'Daftar Kursus' },
    { id: 'l-2', content: 'Cetak Slip Pendaftaran' },
    { id: 'l-3', content: 'Isi Maklumat Pelajar' },
  ],
  ordered_langkah: [],
};

// simple deep clone helper
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// --- Main Component ---
function Mission1_Pengabstrakan({ onContinue, onFeedback }) {
  const [maklumatItems, setMaklumatItems] = useState(() => clone(INITIAL_MAKLUMAT));
  const [langkahItems, setLangkahItems] = useState(() => clone(INITIAL_LANGKAH));
  const [activeId, setActiveId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Scoring State
  const [earnedScore, setEarnedScore] = useState(0);
  const [attempts, setAttempts] = useState(0); // Track attempts locally
  const [isSubmitting, setIsSubmitting] = useState(false);

  function findContainer(itemId) {
    if (!itemId) return null;
    if (Object.keys(maklumatItems).includes(itemId)) return itemId;
    if (Object.keys(langkahItems).includes(itemId)) return itemId;
    for (const container of Object.keys(maklumatItems)) {
      if (maklumatItems[container].find(item => item.id === itemId)) return container;
    }
    for (const container of Object.keys(langkahItems)) {
      if (langkahItems[container].find(item => item.id === itemId)) return container;
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
    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    // Reset correct state if user moves items after checking
    setIsCorrect(false);

    if (Object.keys(maklumatItems).includes(activeContainer)) {
      setItemsState(maklumatItems, setMaklumatItems, active, over);
    } else {
      setItemsState(langkahItems, setLangkahItems, active, over);
    }
    setActiveId(null);
  }

  function setItemsState(items, setItems, active, over) {
    const activeId = active.id;
    const overId = over.id;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId) || overId;

    if (activeContainer !== overContainer) {
      setItems((prev) => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer];
        const activeIndex = activeItems.findIndex((item) => item.id === activeId);
        const [movedItem] = activeItems.splice(activeIndex, 1);
        let overIndex;
        const overItem = overItems.find(item => item.id === overId);
        if (overItem) {
          overIndex = overItems.findIndex((item) => item.id === overId);
        } else {
          overIndex = overItems.length;
        }
        overItems.splice(overIndex, 0, movedItem);
        return { ...prev, [activeContainer]: [...activeItems], [overContainer]: [...overItems] };
      });
    } else {
      setItems((prev) => {
        const activeItems = prev[activeContainer];
        const activeIndex = activeItems.findIndex((item) => item.id === active.id);
        const overIndex = activeItems.findIndex((item) => item.id === overId);
        return { ...prev, [activeContainer]: arrayMove(activeItems, activeIndex, overIndex) };
      });
    }
  }

  const checkAnswer = async () => {
    const correctMaklumat = ['m-1', 'm-3', 'm-5', 'm-7', 'm-8'].sort();
    const playerMaklumat = maklumatItems.penting.map(i => i.id).sort();
    const isMaklumatCorrect = JSON.stringify(correctMaklumat) === JSON.stringify(playerMaklumat);
    const correctLangkah = ['l-3', 'l-1', 'l-2'];
    const playerLangkah = langkahItems.ordered_langkah.map(i => i.id);
    const isLangkahCorrect = JSON.stringify(correctLangkah) === JSON.stringify(playerLangkah);

    const ok = isMaklumatCorrect && isLangkahCorrect;

    if (!ok) {
        // Incorrect: Deduct marks locally
        setAttempts(prev => prev + 1);
        setIsCorrect(false);

        let errorMsg = 'Hmm… ada langkah belum kena. ';
        if (!isMaklumatCorrect) errorMsg += 'Semak bahagian MAKLUMAT. ';
        if (!isLangkahCorrect) errorMsg += 'Semak bahagian MODEL LOGIK.';
        
        // Robot Glow: Red ('false')
        onFeedback(errorMsg, 3000, false);
        return;
    }

    // Correct: Calculate final score for this session
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
          mission: 1,
          phase: 'pengabstrakan',
          isCorrect: true,
          score: calculatedScore, // Send calculated score
          badge: null
        })
      });

      setEarnedScore(calculatedScore);
      setIsCorrect(true);
      // Robot Glow: Green ('true')
      onFeedback(`Hebat! Kamu berjaya membina model logik ringkas untuk sistem pendaftaran. (+${calculatedScore} Markah)`, 3000, true);
      
    } catch (err) {
      console.error("Error submitting:", err);
      onFeedback('⚠️ Ralat menghubungi pelayan.', 3000, false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    setMaklumatItems(clone(INITIAL_MAKLUMAT));
    setLangkahItems(clone(INITIAL_LANGKAH));
    setActiveId(null);
    setIsCorrect(false);
    setAttempts(0); // Reset attempts to 0 for fresh scoring
    // Robot Glow: Neutral
    onFeedback('🔄 Susunan telah direset. Cuba semula dengan teliti.', 2000, null);
  };

  const allItems = [...maklumatItems.available, ...maklumatItems.penting, ...langkahItems.available_langkah, ...langkahItems.ordered_langkah];
  const activeItem = activeId ? allItems.find(i => i.id === activeId) : null;

  return (
    <div>
      <h3>TAHAP 2: PENGABSTRAKAN</h3>
      <p>Sistem Akademik menerima banyak maklumat pelajar tetapi hanya data penting diperlukan untuk pendaftaran. 
Tugas anda ialah  memilih dan menyusun maklumat penting supaya proses pendaftaran berjalan dengan betul!
</p>
      <hr />
      
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="dnd-container-split">
          <DroppableSortableColumn id="available" title="MAKLUMAT" items={maklumatItems.available} />
          <DroppableSortableColumn id="penting" title="MAKLUMAT PENTING" items={maklumatItems.penting} />
        </div>
        
        <div className="dnd-container-split">
          <DroppableSortableColumn id="available_langkah" title="LANGKAH MODEL (TIDAK TERSUSUN)" items={langkahItems.available_langkah} />
          <DroppableSortableColumn id="ordered_langkah" title="MODEL LOGIK (TERSUSUN)" items={langkahItems.ordered_langkah} />
        </div>
        
        <DragOverlay>
          {activeItem ? <DraggableItem id={activeItem.id} content={activeItem.content} /> : null}
        </DragOverlay>
      </DndContext>
      
      <hr />
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button className="primary-button" onClick={handleReset} disabled={isSubmitting}>
          Buat Semula
        </button>

        <button className="primary-button" onClick={checkAnswer} disabled={isSubmitting}>
          {isSubmitting ? 'Menghantar...' : 'Semak Jawapan'}
        </button>

        <button
          className="primary-button"
          style={{
            backgroundColor: isCorrect ? '#2ecc71' : '#999',
            cursor: isCorrect ? 'pointer' : 'not-allowed'
          }}
          disabled={!isCorrect}
          onClick={isCorrect ? () => onContinue(earnedScore) : undefined}
        >
          Seterusnya
        </button>
      </div>
    </div>
  );
}

export default Mission1_Pengabstrakan;
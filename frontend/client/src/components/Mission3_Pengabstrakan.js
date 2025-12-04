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

// --- Draggable Overlay Item ---
function DraggableItem({ content }) {
  return <div className="dnd-item-overlay">{content}</div>;
}

// --- Droppable Column ---
function DroppableSortableColumn({ id, title, items }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`dnd-column-split ${id.startsWith('available') ? 'available' : ''}`}>
      <h4>{title.toUpperCase()}</h4>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {items.map(item => (
          <SortableItem key={item.id} id={item.id} content={item.content} />
        ))}
      </SortableContext>
    </div>
  );
}

// --- Initial States ---
const INITIAL_DATA = {
  available_data: [
    { id: 'd-1', content: 'Nama Pelajar' },
    { id: 'd-2', content: 'No Pendaftaran' },
    { id: 'd-3', content: 'Jenis Yuran (Pengajian, Asrama, Aktiviti)' },
    { id: 'd-4', content: 'Jumlah Yuran' },
    { id: 'd-5', content: 'Kaedah Bayaran (FPX / Tunai)' },
    { id: 'd-6', content: 'No Telefon' },
    { id: 'd-7', content: 'Jumlah Bayaran' },
    { id: 'd-8', content: 'Tarikh Bayaran' },
    { id: 'd-9', content: 'Status Bayaran (Lunas / Belum Lunas)' },
    { id: 'd-10', content: 'Nama Pegawai Kewangan' },
  ],
  penting: [],
};

const INITIAL_STEPS = {
  available_langkah: [
    { id: 'l-1', content: 'Masukkan Jumlah Bayaran' },
    { id: 'l-2', content: 'Papar Baki Yuran' },
    { id: 'l-3', content: 'Masukkan Jumlah Yuran' },
    { id: 'l-4', content: 'Tentukan Status Bayaran (Lunas/Belum Lunas)' },
    { id: 'l-5', content: 'Masukkan No Pendaftaran' },
    { id: 'l-6', content: 'Kira Baki = Jumlah Yuran – Jumlah Bayaran' },
  ],
  ordered_langkah: [],
};

const clone = (obj) => JSON.parse(JSON.stringify(obj));

// --- Main Component ---
function Mission3_Pengabstrakan({ onContinue, onFeedback }) {
  const [dataItems, setDataItems] = useState(() => clone(INITIAL_DATA));
  const [stepItems, setStepItems] = useState(() => clone(INITIAL_STEPS));
  const [activeId, setActiveId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Scoring State
  const [earnedScore, setEarnedScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function findContainer(itemId) {
    if (!itemId) return null;
    if (Object.keys(dataItems).includes(itemId)) return itemId;
    if (Object.keys(stepItems).includes(itemId)) return itemId;
    for (const container of Object.keys(dataItems)) if (dataItems[container].find(item => item.id === itemId)) return container;
    for (const container of Object.keys(stepItems)) if (stepItems[container].find(item => item.id === itemId)) return container;
    return null;
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) { setActiveId(null); return; }
    
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    if (!activeContainer || !overContainer) { setActiveId(null); return; }

    setIsCorrect(false); // Reset state

    if (Object.keys(dataItems).includes(activeContainer)) {
        moveItem(dataItems, setDataItems, active, over);
    } else {
        moveItem(stepItems, setStepItems, active, over);
    }

    setActiveId(null);
  }

  function moveItem(items, setItems, active, over) {
    const activeId = active.id;
    const overId = over.id;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId) || overId;

    if (activeContainer !== overContainer) {
      setItems(prev => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer];
        const index = activeItems.findIndex(item => item.id === activeId);
        const [moved] = activeItems.splice(index, 1);
        const overIndex = overItems.findIndex(item => item.id === overId);
        if (overIndex === -1) overItems.push(moved);
        else overItems.splice(overIndex, 0, moved);
        return { ...prev, [activeContainer]: [...activeItems], [overContainer]: [...overItems] };
      });
    } else {
      setItems(prev => {
        const list = prev[activeContainer];
        const fromIndex = list.findIndex(i => i.id === activeId);
        const toIndex = list.findIndex(i => i.id === overId);
        return { ...prev, [activeContainer]: arrayMove(list, fromIndex, toIndex) };
      });
    }
  }

  // --- CHECK Answer ---
  const checkAnswer = async () => {
    // Based on slide 989 logic (implied) or your previous code:
    // Correct Data: No Pendaftaran, Jenis Yuran, Jumlah Yuran, Jumlah Bayaran, Status Bayaran
    const correctData = ['d-2','d-3','d-4','d-7','d-9'].sort();
    const playerData = dataItems.penting.map(i => i.id).sort();
    
    // Correct Steps Order: Input No -> Input Yuran -> Input Bayaran -> Kira Baki -> Tentukan Status -> Papar
    const correctLangkah = ['l-5','l-3','l-1','l-6','l-4','l-2'];
    const playerLangkah = stepItems.ordered_langkah.map(i => i.id);

    const ok = 
        JSON.stringify(correctData) === JSON.stringify(playerData) &&
        JSON.stringify(correctLangkah) === JSON.stringify(playerLangkah);

    if (!ok) {
        setAttempts(prev => prev + 1);
        setIsCorrect(false);
        onFeedback('❌ Salah “Urutan ini belum logik. Fikir semula urutan sebenar dalam proses bayaran pelajar.” (-5 Markah)', 3000, false);
        return;
    }

    // Correct
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
          mission: 3,
          phase: 'pengabstrakan',
          isCorrect: true,
          score: calculatedScore,
          badge: null
        })
      });

      setEarnedScore(calculatedScore);
      setIsCorrect(true);
      onFeedback(`✅ “Hebat! Anda telah menyusun logik sistem kewangan Kampus Digital dengan tepat. Kini sistem boleh memproses bayaran pelajar secara automatik! (+${calculatedScore} Markah)`, 3000, true);

    } catch (err) {
      console.error("Error submitting:", err);
      onFeedback('⚠️ Ralat menghubungi pelayan.', 3000, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDataItems(clone(INITIAL_DATA));
    setStepItems(clone(INITIAL_STEPS));
    setActiveId(null);
    setIsCorrect(false);
    setAttempts(0); // Reset attempts
    onFeedback('🔄 Susunan telah direset. Cuba semula dengan teliti.', 2000, null);
  };

  const allItems = [...dataItems.available_data, ...dataItems.penting, ...stepItems.available_langkah, ...stepItems.ordered_langkah];
  const activeItem = activeId ? allItems.find(i => i.id === activeId) : null;

  return (
    <div>
      <h3>TAHAP 2: PENGABSTRAKAN</h3>
      <p>
           Sistem Kewangan Kampus Digital kini sedang dibangunkan untuk mengurus bayaran yuran pelajar secara automatik. Namun, beberapa langkah pseudokod masih bercampur dan mengandungi data yang tidak diperlukan.  Bantu Sistem Kewangan menapis data penting dan menyusun semula langkah logik yang tepat supaya pengiraan yuran setiap pelajar berjalan dengan betul!
      </p>
      <hr />

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="dnd-container-split">
          <DroppableSortableColumn id="available_data" title="SENARAI DATA" items={dataItems.available_data} />
          <DroppableSortableColumn id="penting" title="DATA PENTING" items={dataItems.penting} />
        </div>
        <div className="dnd-container-split">
          <DroppableSortableColumn id="available_langkah" title="LANGKAH MODEL (TIDAK TERSUSUN)" items={stepItems.available_langkah} />
          <DroppableSortableColumn id="ordered_langkah" title="MODEL LOGIK (TERSUSUN)" items={stepItems.ordered_langkah} />
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
          onClick={isCorrect ? () => onContinue(earnedScore) : undefined}
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

export default Mission3_Pengabstrakan;
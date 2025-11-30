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

// --- Sortable Item ---
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

// --- Initial Items ---
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
function Mission3_Penguraian({ onContinue, setRobotText, onFeedback, isCorrect }) {
  const [items, setItems] = useState(clone(INITIAL_ITEMS));
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setRobotText('Kenal pasti Input, Proses, dan Output untuk sistem yuran pelajar.');
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

  const checkAnswer = () => {
    const correctInput = ['item-6','item-2','item-8','item-5','item-11'].sort();
    const correctProses = ['item-3','item-1','item-10'].sort();
    const correctOutput = ['item-7','item-9','item-4'].sort();

    const playerInput = items.input.map(i => i.id).sort();
    const playerProses = items.proses.map(i => i.id).sort();
    const playerOutput = items.output.map(i => i.id).sort();

    if (
      JSON.stringify(playerInput) === JSON.stringify(correctInput) &&
      JSON.stringify(playerProses) === JSON.stringify(correctProses) &&
      JSON.stringify(playerOutput) === JSON.stringify(correctOutput)
    ) {
      onFeedback?.('✅ Bagus! Anda telah mengenal pasti komponen utama sistem kewangan Kampus Digital.', true);
    } else {
      onFeedback?.('⚠️ Semak semula. Semua data pelajar seperti nombor pendaftaran dan jumlah bayaran adalah Input, manakala pengiraan baki ialah Proses.', false);
    }
  };

  const handleReset = () => {
    setItems(clone(INITIAL_ITEMS));
    setActiveId(null);
    onFeedback?.('Susunan telah direset. Cuba semula dengan teliti.', null);
  };

  const activeItem = activeId
    ? [...items.available, ...items.input, ...items.proses, ...items.output].find(i => i.id === activeId)
    : null;

  return (
    <div>
      <h3>TAHAP 1: PENGURAIAN</h3>
      <p>
        Dalam Sistem Kewangan Kampus Digital, setiap pelajar perlu membayar beberapa jenis yuran.
        Tugas anda ialah mengenal pasti Input, Proses, dan Output bagi setiap item supaya sistem boleh mengira jumlah keseluruhan dengan betul.
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

      <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'10px' }}>
        <button onClick={handleReset} className="primary-button">Buat Semula</button>
        <button onClick={checkAnswer} className="primary-button">Semak Jawapan</button>
        <button
          onClick={isCorrect ? onContinue : undefined}
          className="primary-button"
          style={{
            backgroundColor:'#2ecc71',
            opacity: isCorrect ? 1 : 0.5,
            cursor: isCorrect ? 'pointer' : 'not-allowed'
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

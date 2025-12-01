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

// --- Overlay while dragging ---
function DraggableItem({ content }) {
  return <div className="dnd-item-overlay">{content}</div>;
}

// --- Droppable Column ---
function DroppableSortableColumn({ id, title, items }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`dnd-column-split ${id.startsWith('available') ? 'available' : ''}`}
    >
      <h4>{title}</h4>
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
  available: [
    { id: 'd-1', content: 'Nama Pelajar' },
    { id: 'd-2', content: 'Markah PA' },
    { id: 'd-3', content: 'Status Lulus' },
    { id: 'd-4', content: 'Kelas' },
    { id: 'd-5', content: 'Program' },
    { id: 'd-6', content: 'Syarat Lulus (≥50%)' },
    { id: 'd-7', content: 'Markah PB' },
    { id: 'd-8', content: 'Tarikh Cetakan Slip' },
    { id: 'd-9', content: 'No Telefon' },
    { id: 'd-10', content: 'Gred Huruf' },
  ],
  penting: [],
};

const INITIAL_STEPS = {
  available_langkah: [
    { id: 'l-1', content: 'Semak Markah PB dan PA ≥50' },
    { id: 'l-2', content: 'Semak Kehadiran ≥80%' },
    { id: 'l-3', content: 'Tentukan Status: Lulus atau Gagal' },
  ],
  ordered_langkah: [],
};

// --- Deep Clone Helper ---
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// --- Main Component ---
function Mission2_Pengabstrakan({ onContinue, setRobotText, onFeedback }) {
  const [dataItems, setDataItems] = useState(() => clone(INITIAL_DATA));
  const [stepItems, setStepItems] = useState(() => clone(INITIAL_STEPS));
  const [activeId, setActiveId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // --- Helpers ---
  function findContainer(itemId) {
    if (!itemId) return null;
    for (const container of Object.keys(dataItems)) {
      if (dataItems[container].find(i => i.id === itemId)) return container;
    }
    for (const container of Object.keys(stepItems)) {
      if (stepItems[container].find(i => i.id === itemId)) return container;
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
    const overContainer = findContainer(over.id) || over.id;
    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    setIsCorrect(false); // Unlock next button after any drag

    // Determine which state to update
    if (Object.keys(dataItems).includes(activeContainer) || Object.keys(dataItems).includes(overContainer)) {
      updateItemsState(dataItems, setDataItems, active, over);
    } else {
      updateItemsState(stepItems, setStepItems, active, over);
    }

    setActiveId(null);
  }

  function updateItemsState(itemsObj, setItems, active, over) {
    const activeIdLocal = active.id;
    const overIdLocal = over.id;
    const activeContainer = findContainer(activeIdLocal);
    const overContainer = findContainer(overIdLocal) || overIdLocal;

    if (activeContainer === overContainer) {
      setItems(prev => {
        const list = [...prev[activeContainer]];
        const fromIndex = list.findIndex(i => i.id === activeIdLocal);
        const toIndex = list.findIndex(i => i.id === overIdLocal);
        if (fromIndex === -1 || toIndex === -1) return prev;
        const newList = arrayMove(list, fromIndex, toIndex);
        return { ...prev, [activeContainer]: newList };
      });
      return;
    }

    // Moving between containers
    setItems(prev => {
      const prevActiveList = prev[activeContainer] || [];
      const prevOverList = prev[overContainer] || [];
      const movedItem = prevActiveList.find(i => i.id === activeIdLocal);
      if (!movedItem) return prev;

      const newActiveList = prevActiveList.filter(i => i.id !== activeIdLocal);
      const overIndex = prevOverList.findIndex(i => i.id === overIdLocal);
      const newOverList = [...prevOverList];
      if (overIndex === -1) newOverList.push(movedItem);
      else newOverList.splice(overIndex, 0, movedItem);

      return { ...prev, [activeContainer]: newActiveList, [overContainer]: newOverList };
    });
  }

  // --- Check Answer ---
  function checkAnswer() {
    const correctDataPenting = ['d-2','d-3','d-6','d-7','d-10'].sort();
    const userDataPenting = dataItems.penting.map(i => i.id).sort();
    const isDataCorrect = JSON.stringify(correctDataPenting) === JSON.stringify(userDataPenting);

    const correctLangkah = ['l-1','l-2','l-3'];
    const userLangkah = stepItems.ordered_langkah.map(i => i.id);
    const isLangkahCorrect = JSON.stringify(correctLangkah) === JSON.stringify(userLangkah);

    if (isDataCorrect && isLangkahCorrect) {
      setIsCorrect(true);
      onFeedback('✅ Betul: Hebat! Anda berjaya mengenal pasti semua maklumat penting. Sistem kini dapat menilai keputusan dengan logik yang betul.', 3000, true);
    } else {
      setIsCorrect(false);
      onFeedback('❌ Salah: Ada maklumat tidak relevan dipilih. Ingat, hanya data yang mempengaruhi syarat lulus digunakan untuk keputusan.', 3000, false);
    }
  }

  // --- Reset ---
  function handleReset() {
    setDataItems(clone(INITIAL_DATA));
    setStepItems(clone(INITIAL_STEPS));
    setActiveId(null);
    setIsCorrect(false);
    onFeedback('🔄 Susunan telah direset. Cuba semula dengan teliti.');
  }

  const allItems = [
    ...dataItems.available,
    ...dataItems.penting,
    ...stepItems.available_langkah,
    ...stepItems.ordered_langkah,
  ];
  const activeItem = activeId ? allItems.find(i => i.id === activeId) : null;

  return (
    <div>
      <h3>TAHAP 2: PENGABSTRAKAN</h3>
      <p>
           Sistem Peperiksaan perlu mengenal pasti maklumat penting untuk menentukan sama ada pelajar lulus atau gagal. Tugas anda ialah  memilih data yang benar-benar diperlukan dalam penilaian keputusan pelajar, dan abaikan maklumat yang tidak relevan.

      </p>
      <hr />

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="dnd-container-split">
          <DroppableSortableColumn
            id="available"
            title="SENARAI DATA"
            items={dataItems.available}
          />
          <DroppableSortableColumn
            id="penting"
            title="DATA PENTING"
            items={dataItems.penting}
          />
        </div>

        <div className="dnd-container-split">
          <DroppableSortableColumn
            id="available_langkah"
            title="LANGKAH MODEL (TIDAK TERSUSUN)"
            items={stepItems.available_langkah}
          />
          <DroppableSortableColumn
            id="ordered_langkah"
            title="MODEL LOGIK (TERSUSUN)"
            items={stepItems.ordered_langkah}
          />
        </div>

        <DragOverlay>
          {activeItem ? <DraggableItem content={activeItem.content} /> : null}
        </DragOverlay>
      </DndContext>

      <hr />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
  <button
    className="primary-button"
    onClick={handleReset}
    style={{ transition: 'transform 0.2s ease' }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
  >
    Buat Semula
  </button>

  <button
    className="primary-button"
    onClick={checkAnswer}
    style={{ transition: 'transform 0.2s ease' }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
  >
    Semak Jawapan
  </button>

  <button
    className="primary-button"
    onClick={isCorrect ? onContinue : undefined}
    disabled={!isCorrect}
    style={{
      backgroundColor: '#2ecc71',
      opacity: isCorrect ? 1 : 0.5,
      cursor: isCorrect ? 'pointer' : 'not-allowed',
      transition: 'transform 0.2s ease, background-color 0.2s ease',
    }}
    onMouseEnter={(e) => isCorrect && (e.currentTarget.style.transform = 'scale(1.05)')}
    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
  >
    Seterusnya
  </button>
</div>

    </div>
  );
}

export default Mission2_Pengabstrakan;

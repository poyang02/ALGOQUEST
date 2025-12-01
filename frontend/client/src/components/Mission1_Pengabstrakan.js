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

  // controls "Seterusnya" button enabled state
  const [isCorrect, setIsCorrect] = useState(false);

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
    const overContainer = findContainer(over.id) || over.id;

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    // any drag after checking should "unlock" next button until they check again
    setIsCorrect(false);

    // decide which state we should update (maklumat vs langkah)
    if (Object.keys(maklumatItems).includes(activeContainer) || Object.keys(maklumatItems).includes(overContainer)) {
      // operate on maklumatItems
      setItemsStateImmutable(maklumatItems, setMaklumatItems, active, over);
    } else {
      // operate on langkahItems
      setItemsStateImmutable(langkahItems, setLangkahItems, active, over);
    }

    setActiveId(null);
  }

  // immutable state updater for a single items-object (either maklumatItems or langkahItems)
  function setItemsStateImmutable(itemsObj, setItems, active, over) {
    const activeIdLocal = active.id;
    const overIdLocal = over.id;
    const activeContainer = findContainer(activeIdLocal);
    const overContainer = findContainer(overIdLocal) || overIdLocal;

    // same-container reorder
    if (activeContainer === overContainer) {
      setItems(prev => {
        const list = [...prev[activeContainer]];
        const fromIndex = list.findIndex(i => i.id === activeIdLocal);
        const toIndex = list.findIndex(i => i.id === overIdLocal);
        if (fromIndex === -1 || toIndex === -1) return prev;
        const newList = arrayMove(list, fromIndex, toIndex);
        return {
          ...prev,
          [activeContainer]: newList,
        };
      });
      return;
    }

    // moving item between containers
    setItems(prev => {
      const prevActiveList = prev[activeContainer] || [];
      const prevOverList = prev[overContainer] || [];

      const movedItem = prevActiveList.find(i => i.id === activeIdLocal);
      if (!movedItem) return prev;

      const newActiveList = prevActiveList.filter(i => i.id !== activeIdLocal);
      // compute insertion index for overContainer
      const overItemIndex = prevOverList.findIndex(i => i.id === overIdLocal);
      const newOverList = [...prevOverList];
      if (overItemIndex === -1) {
        newOverList.push(movedItem);
      } else {
        newOverList.splice(overItemIndex, 0, movedItem);
      }

      return {
        ...prev,
        [activeContainer]: newActiveList,
        [overContainer]: newOverList,
      };
    });
  }

  const checkAnswer = () => {
    const correctMaklumat = ['m-1', 'm-3', 'm-5', 'm-7', 'm-8'].sort();
    const playerMaklumat = maklumatItems.penting.map(i => i.id).sort();
    const isMaklumatCorrect =
      JSON.stringify(correctMaklumat) === JSON.stringify(playerMaklumat);

    const correctLangkah = ['l-3', 'l-1', 'l-2'];
    const playerLangkah = langkahItems.ordered_langkah.map(i => i.id);
    const isLangkahCorrect =
      JSON.stringify(correctLangkah) === JSON.stringify(playerLangkah);

    if (isMaklumatCorrect && isLangkahCorrect) {
      setIsCorrect(true);
      onFeedback('Hebat! Kamu berjaya membina model logik ringkas untuk sistem pendaftaran.', 3000, true);
    } else {
      setIsCorrect(false);
      onFeedback('Hmm… ada langkah belum kena. Cuba semak semula alirannya!', 3000, false);
    }
  };

  const handleReset = () => {
    setMaklumatItems(clone(INITIAL_MAKLUMAT));
    setLangkahItems(clone(INITIAL_LANGKAH));
    setActiveId(null);
    setIsCorrect(false);
    onFeedback('🔄 Susunan telah direset. Cuba semula dengan teliti.');
  };

  const allItems = [
    ...maklumatItems.available,
    ...maklumatItems.penting,
    ...langkahItems.available_langkah,
    ...langkahItems.ordered_langkah,
  ];
  const activeItem = activeId ? allItems.find(i => i.id === activeId) : null;

  return (
    <div>
      <h3>TAHAP 2: PENGABSTRAKAN</h3>
      <p>
        Sistem Akademik menerima banyak maklumat pelajar tetapi hanya data penting diperlukan untuk pendaftaran. 
Tugas anda ialah memilih dan menyusun maklumat penting supaya proses pendaftaran berjalan dengan betul!

      </p>
      <hr />

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="dnd-container-split">
          {/* Maklumat Drag-and-Drop */}
          <DroppableSortableColumn
            id="available"
            title="MAKLUMAT"
            items={maklumatItems.available}
          />
          <DroppableSortableColumn
            id="penting"
            title="MAKLUMAT PENTING"
            items={maklumatItems.penting}
          />
        </div>

        <div className="dnd-container-split">
          {/* Langkah Drag-and-Drop */}
          <DroppableSortableColumn
            id="available_langkah"
            title="LANGKAH MODEL (TIDAK TERSUSUN)"
            items={langkahItems.available_langkah}
          />
          <DroppableSortableColumn
            id="ordered_langkah"
            title="MODEL LOGIK (TERSUSUN)"
            items={langkahItems.ordered_langkah}
          />
        </div>

        <DragOverlay>
          {activeItem ? (
            <DraggableItem id={activeItem.id} content={activeItem.content} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <hr />

      {/* Buttons aligned to the RIGHT */}
      <div
  style={{
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  }}
>
  <button className="primary-button" onClick={handleReset}>
    Buat Semula
  </button>

  <button className="primary-button" onClick={checkAnswer}>
    Semak Jawapan
  </button>

  <button
    className="primary-button"
    style={{
      backgroundColor: isCorrect ? '#2ecc71' : '#999',
      cursor: isCorrect ? 'pointer' : 'not-allowed',
    }}
    disabled={!isCorrect}
    onClick={isCorrect ? onContinue : undefined}
  >
    Seterusnya
  </button>
</div>

    </div>
  );
}

export default Mission1_Pengabstrakan;

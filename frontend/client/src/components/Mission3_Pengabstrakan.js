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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="dnd-item">
      {content}
    </div>
  );
}

// --- Draggable Overlay ---
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
        {items.map(item => <SortableItem key={item.id} id={item.id} content={item.content} />)}
      </SortableContext>
    </div>
  );
}

// --- Mission3_Pengabstrakan ---
function Mission3_Pengabstrakan({ onContinue, setRobotText, onFeedback, isCorrect }) {
  const [dataItems, setDataItems] = useState({
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
  });

  const [langkahItems, setLangkahItems] = useState({
    available_langkah: [
      { id: 'l-1', content: 'Masukkan Jumlah Bayaran' },
      { id: 'l-2', content: 'Papar Baki Yuran' },
      { id: 'l-3', content: 'Masukkan Jumlah Yuran' },
      { id: 'l-4', content: 'Tentukan Status Bayaran (Lunas/Belum Lunas)' },
      { id: 'l-5', content: 'Masukkan No Pendaftaran' },
      { id: 'l-6', content: 'Kira Baki = Jumlah Yuran – Jumlah Bayaran' },
    ],
    ordered_langkah: [],
  });

  const [activeId, setActiveId] = useState(null);

  function findContainer(itemId) {
    if (!itemId) return null;
    if (Object.keys(dataItems).includes(itemId)) return itemId;
    if (Object.keys(langkahItems).includes(itemId)) return itemId;
    for (const container of Object.keys(dataItems)) if (dataItems[container].find(item => item.id === itemId)) return container;
    for (const container of Object.keys(langkahItems)) if (langkahItems[container].find(item => item.id === itemId)) return container;
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

    if (Object.keys(dataItems).includes(activeContainer)) moveItem(dataItems, setDataItems, active, over);
    else moveItem(langkahItems, setLangkahItems, active, over);

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

  const checkAnswer = () => {
    const correctData = ['d-2','d-3','d-4','d-7','d-9'].sort();
    const playerData = dataItems.penting.map(i => i.id).sort();
    const correctLangkah = ['l-5','l-3','l-1','l-6','l-4','l-2'];
    const playerLangkah = langkahItems.ordered_langkah.map(i => i.id);

    if (JSON.stringify(correctData) === JSON.stringify(playerData) &&
        JSON.stringify(correctLangkah) === JSON.stringify(playerLangkah)) {
      onFeedback('✅ Bagus! Anda telah mengenal pasti komponen utama sistem kewangan Kampus Digital.', true);
    } else {
      onFeedback('⚠️ Semak semula. Semua data pelajar seperti nombor pendaftaran dan jumlah bayaran adalah Input, manakala pengiraan baki ialah Proses.', false);
    }
  };

  const handleReset = () => {
    setDataItems({
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
    });
    setLangkahItems({
      available_langkah: [
        { id: 'l-1', content: 'Masukkan Jumlah Bayaran' },
        { id: 'l-2', content: 'Papar Baki Yuran' },
        { id: 'l-3', content: 'Masukkan Jumlah Yuran' },
        { id: 'l-4', content: 'Tentukan Status Bayaran (Lunas/Belum Lunas)' },
        { id: 'l-5', content: 'Masukkan No Pendaftaran' },
        { id: 'l-6', content: 'Kira Baki = Jumlah Yuran – Jumlah Bayaran' },
      ],
      ordered_langkah: [],
    });
    onFeedback('🔄 Susunan telah direset. Cuba semula dengan teliti.', null);
  };

  const allItems = [...dataItems.available_data, ...dataItems.penting, ...langkahItems.available_langkah, ...langkahItems.ordered_langkah];
  const activeItem = activeId ? allItems.find(i => i.id === activeId) : null;

  return (
    <div>
      <h3>TAHAP 2: PENGABSTRAKAN</h3>
      <p>
        Sistem Kewangan Kampus Digital sedang dibangunkan untuk mengurus bayaran yuran pelajar secara automatik. Bantu sistem menapis data penting dan menyusun langkah logik supaya pengiraan yuran berjalan dengan betul.
      </p>
      <hr />

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="dnd-container-split">
          <DroppableSortableColumn id="available_data" title="SENARAI DATA" items={dataItems.available_data} />
          <DroppableSortableColumn id="penting" title="DATA PENTING" items={dataItems.penting} />
        </div>
        <div className="dnd-container-split">
          <DroppableSortableColumn id="available_langkah" title="LANGKAH MODEL (TIDAK TERSUSUN)" items={langkahItems.available_langkah} />
          <DroppableSortableColumn id="ordered_langkah" title="MODEL LOGIK (TERSUSUN)" items={langkahItems.ordered_langkah} />
        </div>
        <DragOverlay>
          {activeItem && <DraggableItem content={activeItem.content} />}
        </DragOverlay>
      </DndContext>

      <hr />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
        <button onClick={handleReset} className="primary-button">Buat Semula</button>
        <button onClick={checkAnswer} className="primary-button">Semak Jawapan</button>
        <button
          onClick={isCorrect ? onContinue : undefined}
          className="primary-button"
          style={{
            backgroundColor: '#2ecc71',
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

export default Mission3_Pengabstrakan;

import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ---------- Sortable Item ----------
function SortableItem({ id, content, source = 'list' }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const isShape = source === 'shape';
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: isShape ? '0' : '10px',
    fontSize: isShape ? '0.8rem' : '1rem',
    padding: isShape ? '4px' : '10px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    touchAction: 'none',
    cursor: 'grab',
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`dnd-item flowchart-shape-${isShape ? 'rectangle' : 'list'}`}
    >
      {content}
    </div>
  );
}

// ---------- Drag Overlay ----------
function DraggableItem({ content }) {
  return (
    <div
      className="dnd-item-overlay flowchart-shape-rectangle"
      style={{
        boxShadow: '0 5px 15px rgba(0,0,0,0.25)',
        fontSize: '0.9rem',
        padding: '10px',
      }}
    >
      {content}
    </div>
  );
}

// ---------- Droppable Flowchart Shape ----------
function FlowchartShape({ id, shapeType, items }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  let shapeClass = 'flowchart-shape-rectangle';
  if (shapeType === 'oval') shapeClass = 'flowchart-shape-oval';
  else if (shapeType === 'diamond') shapeClass = 'flowchart-shape-diamond';
  else if (shapeType === 'parallelogram') shapeClass = 'flowchart-shape-parallelogram';

  return (
    <div
      ref={setNodeRef}
      className={`flowchart-shape ${shapeClass}`}
      style={{
        margin: '5px',
        padding: '4px',
        minWidth: '140px',
        minHeight: '60px',
        borderColor: '#00ffff',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderWidth: '2px',
        borderStyle: 'solid',
        outline: isOver ? '2px dashed #00ffff' : 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.length > 0 ? (
          <SortableItem id={items[0].id} content={items[0].content} source="shape" />
        ) : (
          <span style={{ opacity: 0.3, fontSize: '0.7rem', pointerEvents: 'none' }}>
            Seret sini
          </span>
        )}
      </SortableContext>
    </div>
  );
}

// ---------- Main Component ----------
function Mission3_Pembinaan({ onContinue, setRobotText, onBadgeEarned, onFeedback }) {
  const initialItems = {
    available: [
      { id: 's1', content: 'Mula' },
      { id: 's2', content: 'Masukkan No Pendaftaran' },
      { id: 's3', content: 'Masukkan Jenis Yuran, Jumlah Yuran dan Jumlah Bayaran' },
      { id: 's4', content: 'Kira Baki= Jumlah Yuran – Jumlah Bayaran' },
      { id: 's5', content: 'Jika Baki = 0' },
      { id: 's6', content: 'Status Bayaran = Lunas' },
      { id: 's7', content: 'Papar No Pendaftaran, Status Bayaran, Baki Yuran' },
      { id: 's8', content: 'Ulang pelajar seterusnya?' },
      { id: 's9', content: 'Tamat' },
      { id: 's10', content: 'Status Bayaran = Belum Lunas' },
    ],
    oval1: [], parallelogram1: [], parallelogram2: [], rectangle1: [],
    diamond1: [], rectangle2: [], parallelogram3: [], diamond2: [], oval2: [], rectangle3: []
  };

  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);

  function findContainer(itemId) {
    if (!itemId) return null;
    if (Object.prototype.hasOwnProperty.call(items, itemId)) return itemId;
    for (const container of Object.keys(items)) {
      if (items[container].find((item) => item.id === itemId)) return container;
    }
    return null;
  }

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) { setActiveId(null); return; }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer) { setActiveId(null); return; }
    if (activeContainer === overContainer && active.id === over.id) { setActiveId(null); return; }

    setItems(prev => {
      const newState = { ...prev };
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
      const activeIndex = activeItems.findIndex(i => i.id === active.id);
      if (activeIndex === -1) return prev;
      const [movedItem] = activeItems.splice(activeIndex, 1);

      // All shapes accept only 1 item
      if (overItems.length === 0) newState[overContainer] = [movedItem];
      else activeItems.splice(activeIndex, 0, movedItem); // reject drop

      newState[activeContainer] = activeItems;
      return newState;
    });

    setActiveId(null);
    setIsCorrect(false);
  };

  const handleReset = () => {
    setItems(initialItems);
    setIsCorrect(false);
    onFeedback?.('🔄 Carta alir telah direset. Cuba susun semula langkah yang betul.', null);
  };

  const checkAnswer = () => {
    const correctOrder = {
      oval1: 'Mula',
      parallelogram1: 'Masukkan No Pendaftaran',
      parallelogram2: 'Masukkan Jenis Yuran, Jumlah Yuran dan Jumlah Bayaran',
      rectangle1: 'Kira Baki= Jumlah Yuran – Jumlah Bayaran',
      diamond1: 'Jika Baki = 0',
      rectangle2: 'Status Bayaran = Lunas',
      parallelogram3: 'Papar No Pendaftaran, Status Bayaran, Baki Yuran',
      diamond2: 'Ulang pelajar seterusnya?',
      oval2: 'Tamat',
      rectangle3: 'Status Bayaran = Belum Lunas'
    };

    const isRight = Object.entries(correctOrder).every(([slot, text]) =>
      items[slot][0]?.content === text
    );

    setIsCorrect(isRight);
    if (isRight) {
      onFeedback?.('✅ Struktur betul! PB dan PA disemak sebelum status ditetapkan.', true);
      onBadgeEarned?.('Master Algoritma');
    } else {
      onFeedback?.('❌ Semak semula susunan dalam carta alir.', false);
    }
  };

  const handleNext = () => { if (isCorrect) onContinue?.(); };

  const allItems = Object.values(items).flat();
  const activeItem = activeId ? allItems.find(i => i.id === activeId) : null;

  return (
    <div>
      <h3>TAHAP 3: PEMBINAAN ALGORITMA</h3>
      <p><em>Seret jawapan dari pseudokod ke bentuk carta alir yang betul.</em></p>
      <hr />

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', alignItems: 'stretch', marginTop: '20px' }}>
          {/* Pseudocode */}
          <div style={{ width: '320px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ marginTop: 0, textAlign: 'center', color: '#00ffff' }}>PSEUDOKOD</h4>
            <SortableContext items={items.available.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div style={{ flexGrow: 1 }}>
                {items.available.map(item => <SortableItem key={item.id} id={item.id} content={item.content} />)}
              </div>
            </SortableContext>
          </div>

          {/* Flowchart */}
<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', transform: 'scale(0.9)', transformOrigin: 'top center' }}>
  <h4 style={{ marginTop: 0, textAlign: 'center', color: '#00ffff' }}>CARTA ALIR</h4>
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
    <FlowchartShape id="oval1" shapeType="oval" items={items.oval1} /><div style={{ fontSize:'0.8rem' }}>↓</div>
    <FlowchartShape id="parallelogram1" shapeType="parallelogram" items={items.parallelogram1} /><div style={{ fontSize:'0.8rem' }}>↓</div>
    <FlowchartShape id="parallelogram2" shapeType="parallelogram" items={items.parallelogram2} /><div style={{ fontSize:'0.8rem' }}>↓</div>
    <FlowchartShape id="rectangle1" shapeType="rectangle" items={items.rectangle1} /><div style={{ fontSize:'0.8rem' }}>↓</div>
    <FlowchartShape id="diamond1" shapeType="diamond" items={items.diamond1} /><div style={{ fontSize:'0.8rem' }}>↓</div>

    {/* Rectangle2 & Rectangle3 */}
    <div style={{ position:'relative', width:'100%', display:'flex', justifyContent:'center' }}>
      <FlowchartShape id="rectangle2" shapeType="rectangle" items={items.rectangle2} />
      <div style={{ position:'absolute', left:'50%', transform:'translateX(100px) translateY(0)'}}>
        <FlowchartShape id="rectangle3" shapeType="rectangle" items={items.rectangle3} />
      </div>
    </div>

    <div style={{ fontSize:'0.8rem' }}>↓</div>
    <FlowchartShape id="parallelogram3" shapeType="parallelogram" items={items.parallelogram3} /><div style={{ fontSize:'0.8rem' }}>↓</div>
    <FlowchartShape id="diamond2" shapeType="diamond" items={items.diamond2} /><div style={{ fontSize:'0.8rem' }}>↓</div>
    <FlowchartShape id="oval2" shapeType="oval" items={items.oval2} />
  </div>
</div>

        </div>

        <DragOverlay>{activeItem && <DraggableItem content={activeItem.content} />}</DragOverlay>
      </DndContext>

      <hr />
      <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'10px' }}>
        <button onClick={handleReset} className="primary-button">Buat Semula</button>
        <button onClick={checkAnswer} className="primary-button">Semak Jawapan</button>
        <button onClick={handleNext} className="primary-button" style={{ backgroundColor:'#2ecc71', opacity: isCorrect?1:0.5, cursor: isCorrect?'pointer':'not-allowed'}} disabled={!isCorrect}>Seterusnya</button>
      </div>
    </div>
  );
}

export default Mission3_Pembinaan;

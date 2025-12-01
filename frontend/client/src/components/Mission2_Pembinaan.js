import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

// ---------- Sortable item ----------
// source: 'list' (pseudocode) or 'shape' (inside flowchart)
function SortableItem({ id, content, source = 'list' }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="dnd-item flowchart-shape-rectangle"
    >
      {content}
    </div>
  );
}

// ---------- Drag overlay ----------
function DraggableItem({ id, content }) {
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

// ---------- Droppable flowchart shape (container) ----------
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
        minWidth: '130px',
        minHeight: '40px',
        borderColor: '#00ffff',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderWidth: '2px',
        borderStyle: 'solid',
        outline: isOver ? '2px dashed #00ffff' : 'none',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.length > 0 ? (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <SortableItem id={items[0].id} content={items[0].content} source="shape" />
          </div>
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
function Mission2_Pembinaan({ onContinue, setRobotText, onBadgeEarned, onFeedback }) {
  const [items, setItems] = useState({
    available: [
      { id: 's1', content: 'Mula' },
      { id: 's7', content: 'Masukkan Markah PB, Markah PA' },
      { id: 's2', content: 'Jika PB ≥ 50 ?' },
      { id: 's3', content: 'Jika PA ≥ 50 ?' },
      { id: 's5', content: 'Set Status = Lulus' },
      { id: 's4', content: 'Set Status = Gagal' },
      { id: 's6', content: 'Cetak Status' },
      { id: 's8', content: 'Tamat' },
    ],
    oval1: [],
    parallelogram1: [],
    diamond1: [],
    diamond2: [],
    rectangle1: [],
    rectangle2: [],
    parallelogram2: [],
    oval2: [],
  });

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

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setIsCorrect(false);
  };

  const handleDragEnd = (event) => {
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

    if (activeContainer === overContainer && active.id === over.id) {
      setActiveId(null);
      return;
    }

    setItems((prev) => {
      const newState = { ...prev };
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
      const activeIndex = activeItems.findIndex((item) => item.id === active.id);
      if (activeIndex === -1) return prev;
      const [movedItem] = activeItems.splice(activeIndex, 1);

      if (overContainer === 'available') {
        const newAvailable = [...prev.available];
        newAvailable.unshift(movedItem);
        newState[activeContainer] = activeItems;
        newState.available = newAvailable;
        return newState;
      }

      if (overContainer !== 'available') {
        const newOver = [...overItems];
        if (newOver.length === 0) {
          newOver.push(movedItem);
          newState[activeContainer] = activeItems;
          newState[overContainer] = newOver;
          return newState;
        } else {
          const [existing] = newOver.splice(0, 1);
          newOver.push(movedItem);
          const newActive = [...activeItems];
          newActive.push(existing);
          newState[activeContainer] = newActive;
          newState[overContainer] = newOver;
          return newState;
        }
      }
      return prev;
    });
    setActiveId(null);
  };

  const handleReset = () => {
    setItems({
      available: [
        { id: 's1', content: 'Mula' },
        { id: 's7', content: 'Masukkan Markah PB, Markah PA' },
        { id: 's2', content: 'Jika PB ≥ 50 ?' },
        { id: 's3', content: 'Jika PA ≥ 50 ?' },
        { id: 's5', content: 'Set Status = Lulus' },
        { id: 's4', content: 'Set Status = Gagal' },
        { id: 's6', content: 'Cetak Status' },
        { id: 's8', content: 'Tamat' },
      ],
      oval1: [],
      parallelogram1: [],
      diamond1: [],
      diamond2: [],
      rectangle1: [],
      rectangle2: [],
      parallelogram2: [],
      oval2: [],
    });
    setIsCorrect(false);
    setRobotText?.('🔄 Carta alir telah direset. Cuba susun semula langkah yang betul.');
  };

  const checkAnswer = () => {
    const correctOrder = {
      oval1: 'Mula',
      parallelogram1: 'Masukkan Markah PB, Markah PA',
      diamond1: 'Jika PB ≥ 50 ?',
      diamond2: 'Jika PA ≥ 50 ?',
      rectangle1: 'Set Status = Lulus',
      rectangle2: 'Set Status = Gagal',
      parallelogram2: 'Cetak Status',
      oval2: 'Tamat',
    };

    const isRight = Object.entries(correctOrder).every(([slot, text]) => {
      return items[slot][0]?.content === text;
    });

    setIsCorrect(isRight);
    if (isRight) {
      onFeedback?.('✅ Struktur betul! PB dan PA disemak sebelum status ditetapkan.\n\n' +
            '🏅 Anda telah memperoleh lencana "Master Algoritma".', 3000, true);
      onBadgeEarned?.('Master Algoritma');
    } else {
      onFeedback?.('❌ Semak semula susunan dalam carta alir.',3000, false);
    }
  };

  const handleNext = () => {
    if (!isCorrect) return;
    onContinue?.();
  };

  const allItems = Object.values(items).flat();
  const activeItem = activeId ? allItems.find((i) => i.id === activeId) : null;

  return (
    <div>
      <h3>TAHAP 3: PEMBINAAN ALGORITMA</h3>
      <p><em>Sistem Peperiksaan memerlukan algoritma keputusan lulus/gagal.  
Tugas anda ialah  menyusun aliran keputusan dan menukarkannya kepada Carta Alir.
</em></p>
      <hr />

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div
          className="flowchart-container"
          style={{
            display: 'flex',
            gap: '40px',
            justifyContent: 'center',
            alignItems: 'stretch',
            marginTop: '20px',
          }}
        >
          {/* LEFT: Pseudokod list */}
          <div
            className="flowchart-pseudocode"
            style={{
              width: '320px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '20px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h4 style={{ marginTop: 0, textAlign: 'center', color: '#00ffff' }}>
              PSEUDOKOD
            </h4>
            <SortableContext
              items={items.available.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ flexGrow: 1 }}>
                {items.available.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    content={item.content}
                    source="list"
                  />
                ))}
              </div>
            </SortableContext>
          </div>

          {/* RIGHT: Carta Alir */}
          <div
            className="flowchart-boxes"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <h4 style={{ marginTop: 0, textAlign: 'center', color: '#00ffff' }}>
              CARTA ALIR
            </h4>

            <div
              className="flowchart-diagram"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* Main vertical line */}
              <FlowchartShape id="oval1" shapeType="oval" items={items.oval1} />
              <div style={{ margin: '2px 0', fontSize: '0.8rem' }}>↓</div>

              <FlowchartShape
                id="parallelogram1"
                shapeType="parallelogram"
                items={items.parallelogram1}
              />
              <div style={{ margin: '2px 0', fontSize: '0.8rem' }}>↓</div>

              <FlowchartShape
                id="diamond1"
                shapeType="diamond"
                items={items.diamond1}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  margin: '2px 0',
                  fontSize: '0.7rem',
                }}
              >
                <span>Ya</span>
                <span>↓</span>
              </div>

              <FlowchartShape
                id="diamond2"
                shapeType="diamond"
                items={items.diamond2}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  margin: '2px 0',
                  fontSize: '0.7rem',
                }}
              >
                <span>Ya</span>
                <span>↓</span>
              </div>

              {/* Rectangle1 in main line + Rectangle2 branching to the right */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {/* Rectangle1 stays in the main column (center) */}
                <FlowchartShape
                  id="rectangle1"
                  shapeType="rectangle"
                  items={items.rectangle1}
                />

                {/* Rectangle2 appears to the right, in its own invisible column */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(80px)', // adjust 180px to move further/closer
                    top: '50%',
                    translate: '0 -50%',
                  }}
                >
                  <FlowchartShape
                    id="rectangle2"
                    shapeType="rectangle"
                    items={items.rectangle2}
                  />
                </div>
              </div>

              {/* Continue main vertical line below Rectangle1 */}
              <div style={{ margin: '2px 0', fontSize: '0.8rem' }}>↓</div>
              <FlowchartShape
                id="parallelogram2"
                shapeType="parallelogram"
                items={items.parallelogram2}
              />
              <div style={{ margin: '2px 0', fontSize: '0.8rem' }}>↓</div>
              <FlowchartShape id="oval2" shapeType="oval" items={items.oval2} />
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeItem ? (
            <DraggableItem id={activeItem.id} content={activeItem.content} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <hr />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          marginTop: '10px',
        }}
      >
        <button onClick={handleReset} className="primary-button">
          Buat Semula
        </button>
        <button onClick={checkAnswer} className="primary-button">
          Semak Jawapan
        </button>
        <button
          onClick={handleNext}
          className="primary-button"
          style={{
            backgroundColor: '#2ecc71',
            opacity: isCorrect ? 1 : 0.5,
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

export default Mission2_Pembinaan;

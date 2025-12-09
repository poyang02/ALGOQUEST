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

  // NEW: wrap text inside shapes without stretching the shape
  whiteSpace: 'normal',         // allow line breaks
  wordBreak: 'break-word',      // break long words
  overflowWrap: 'break-word',
  textAlign: 'center',
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
    width: '140px',        // fixed width
    height: '50px',        // fixed height
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
      <SortableItem
        id={items[0].id}
        content={items[0].content}
        source="shape"
        style={{
          fontSize: '0.7rem',       // smaller font
          whiteSpace: 'normal',     // allow line breaks
          wordBreak: 'break-word',  // break long words
          overflow: 'hidden',       // prevent overflow
          textAlign: 'center',
        }}
      />
    ) : (
      <span style={{ 
          opacity: 0.3, 
          fontSize: '0.7rem', 
          pointerEvents: 'none', 
          textAlign: 'center',
          whiteSpace: 'normal',
          wordBreak: 'break-word'
        }}
      >
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

  // Backend Integration State
  const [earnedScore, setEarnedScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Reset correct state on drag
    setIsCorrect(false);

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
  };

  const handleReset = () => {
    setItems(initialItems);
    setIsCorrect(false);
    setAttempts(0);
    onFeedback?.('🔄 Carta alir telah direset. Cuba susun semula langkah yang betul.', null);
  };

  const checkAnswer = async () => {
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

    if (!isRight) {
        setAttempts(prev => prev + 1);
        setIsCorrect(false);
        onFeedback?.('❌ Jawapan Salah (Susunan atau Formula Salah) “Masih ada kesilapan logik! (-5 Markah)”', 3000, false);
        return;
    }

    // Correct: Calculate Score
    const calculatedScore = Math.max(5, 25 - (attempts * 5));

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      // Call Backend API
      const response = await fetch('https://algoquest-api.onrender.com/api/mission/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          mission: 3,
          phase: 'pembinaan',
          isCorrect: true,
          score: calculatedScore,
          // Badge awarded if correct on first try
          badge: attempts === 0 ? 'Master Algoritma' : null
        })
      });

      const data = await response.json();

      setEarnedScore(calculatedScore);
      setIsCorrect(true);

      let badgeMsg = '';
      if (attempts === 0) {
           badgeMsg = '\n\n🏅 Anda telah memperoleh lencana "Master Algoritma".';
           onBadgeEarned?.('Master Algoritma');
      }

      onFeedback?.(`✅ Jawapan Betul! “Hebat! Struktur algoritma kewangan kamu lengkap.${badgeMsg}`, 3000, true);

    } catch (err) {
      console.error("Error submitting:", err);
      if (onFeedback) onFeedback('⚠️ Ralat menghubungi pelayan.', 3000, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!isCorrect) return;
    // Pass score AND badge name (if earned) to parent
    const badge = attempts === 0 ? 'Master Algoritma' : null;
    onContinue?.(earnedScore, badge);
  };

  const allItems = Object.values(items).flat();
  const activeItem = activeId ? allItems.find(i => i.id === activeId) : null;

  return (
    <div>
      <h3>TAHAP 3: PEMBINAAN ALGORITMA</h3>
      <p>Sistem Kewangan Kampus Digital kini sedang membina algoritma lengkap untuk memproses bayaran yuran setiap pelajar.  
Bantu sistem menyusun langkah pseudokod dalam urutan yang betul dan padankan setiap langkah dengan simbol carta alir yang sesuai. Pastikan struktur ulangan digunakan supaya proses pembayaran boleh dijalankan untuk setiap pelajar.
</p>
      <hr />

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div style={{ display: 'flex', gap: '100px', justifyContent: 'center', alignItems: 'stretch', marginTop: '20px' }}>
          {/* Pseudocode */}
          <div style={{ width: '320px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ marginTop: 10, textAlign: 'center', color: '#00ffff' }}>PSEUDOKOD</h4>
            <SortableContext items={items.available.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div style={{ flexGrow: 1 }}>
                {items.available.map(item => <SortableItem key={item.id} id={item.id} content={item.content} />)}
              </div>
            </SortableContext>
          </div>

          {/* Flowchart */}
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    transform: 'scale(0.9)',
    transformOrigin: 'top center',
  }}
>
  <h4 style={{ marginTop: 25, textAlign: 'center', color: '#00ffff' }}>
    CARTA ALIR
  </h4>
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
    }}
  >
    <FlowchartShape id="oval1" shapeType="oval" items={items.oval1} />
    <div style={{ fontSize: '0.8rem' }}>↓</div>

    <FlowchartShape id="parallelogram1" shapeType="parallelogram" items={items.parallelogram1} />
    <div style={{ fontSize: '0.8rem' }}>↓</div>

    <FlowchartShape id="parallelogram2" shapeType="parallelogram" items={items.parallelogram2} />
    <div style={{ fontSize: '0.8rem' }}>↓</div>

    <FlowchartShape id="rectangle1" shapeType="rectangle" items={items.rectangle1} />
    <div style={{ fontSize: '0.8rem' }}>↓</div>

    <FlowchartShape id="diamond1" shapeType="diamond" items={items.diamond1} />
    <div style={{ fontSize: '0.8rem' }}>↓Ya</div>

    {/* Rectangle2 & Rectangle3 */}
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <FlowchartShape id="rectangle2" shapeType="rectangle" items={items.rectangle2} />
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(100px) translateY(0)' }}>
        <FlowchartShape id="rectangle3" shapeType="rectangle" items={items.rectangle3} />
      </div>
    </div>

    <div style={{ fontSize: '0.8rem' }}>↓</div>
    <FlowchartShape id="parallelogram3" shapeType="parallelogram" items={items.parallelogram3} />
    <div style={{ fontSize: '0.8rem' }}>↓</div>

    <FlowchartShape id="diamond2" shapeType="diamond" items={items.diamond2} />
    <div style={{ fontSize: '0.8rem' }}>↓Tidak</div>
    <FlowchartShape id="oval2" shapeType="oval" items={items.oval2} />

    {/* === Arrows === */}
    {(() => {
  // Base offset for tweaking entire arrow position
  const arrowOffsetX = 100; // moves arrows horizontally
  const arrowOffsetY = 200; // moves arrows vertically

  // Arrow configurations (adjust top, horizontal, vertical as needed)
  const arrows = {
    arrow1: {
      // Diamond1 → Rectangle3
      top: 220 + arrowOffsetY,
      horizontal: 100,
      vertical: 50,
      label: 'Tidak',
      labelOffset: -15,
    },
    arrow2: {
      // Rectangle3 → Parallelogram3
      top: 370 + arrowOffsetY,
      horizontal: 100,
      vertical: 50,
      label: '',
    },
    arrow3: {
      // Diamond2 → Parallelogram1 (left/up/right)
      top: 500 + arrowOffsetY,
      horizontal: 20,
      vertical: 580,
      label: 'Ya',
      labelOffset: -15,
    },
  };

  // Arrowhead size
  const arrowHeadSize = 6;

  // Helper for arrowhead
  const ArrowHead = ({ top, left, direction }) => {
    const rotation = {
      down: '0deg',
      up: '180deg',
      left: '-90deg',
      right: '90deg',
    }[direction];
    return (
      <div
        style={{
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`,
          width: 0,
          height: 0,
          borderLeft: `${arrowHeadSize}px solid transparent`,
          borderRight: `${arrowHeadSize}px solid transparent`,
          borderBottom: `${arrowHeadSize}px solid #ffffffff`,
          transform: `rotate(${rotation})`,
        }}
      />
    );
  };

  return (
    <>
      {/* Arrow 1: Diamond1 → Rectangle3 */}
      <div
        style={{
          position: 'absolute',
          top: `${arrows.arrow1.top}px`,
          left: `calc(50% + ${arrowOffsetX}px)`,
          width: `${arrows.arrow1.horizontal}px`,
          height: '1px',
          backgroundColor: '#ffffffff',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: `${arrows.arrow1.top}px`,
          left: `calc(50% + ${arrowOffsetX + arrows.arrow1.horizontal}px)`,
          width: '1px',
          height: `${arrows.arrow1.vertical}px`,
          backgroundColor: '#ffffffff',
        }}
      />
      <ArrowHead
        top={arrows.arrow1.top + arrows.arrow1.vertical}
        left={70 + arrowOffsetX + arrows.arrow1.horizontal} // 50% base
        direction="up"
      />
      <span
        style={{
          position: 'absolute',
          top: `${arrows.arrow1.top + arrows.arrow1.labelOffset}px`,
          left: `calc(50% + ${arrowOffsetX + arrows.arrow1.horizontal / 4}px)`,
          fontSize: '0.7rem',
          color: '#ffffffff',
        }}
      >
        {arrows.arrow1.label}
      </span>

      {/* Arrow 2: Rectangle3 → Parallelogram3 */}
      <div
        style={{
          position: 'absolute',
          top: `${arrows.arrow2.top}px`,
          left: `calc(50% + ${arrowOffsetX + arrows.arrow2.horizontal}px)`,
          width: '1px',
          height: `${arrows.arrow2.vertical}px`,
          backgroundColor: '#ffffffff',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: `${arrows.arrow2.top + arrows.arrow2.vertical}px`,
          left: `calc(50% + ${arrowOffsetX}px)`,
          width: `${arrows.arrow2.horizontal}px`,
          height: '1px',
          backgroundColor: '#ffffffff',
        }}
      />
      <ArrowHead
        top={-2 + arrows.arrow2.top + arrows.arrow2.vertical}
        left={70 + arrowOffsetX} // end of horizontal line
        direction="left"
      />

      {/* Arrow 3: Diamond2 → Parallelogram1 (left/up/right) */}
      <div
        style={{
          position: 'absolute',
          top: `${arrows.arrow3.top}px`,
          left: `calc(50% - ${arrowOffsetX}px)`,
          width: `${arrows.arrow3.horizontal}px`,
          height: '1px',
          backgroundColor: '#ffffffff',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: `${arrows.arrow3.top - arrows.arrow3.vertical}px`,
          left: `calc(50% - ${arrowOffsetX}px)`,
          width: '1px',
          height: `${arrows.arrow3.vertical}px`,
          backgroundColor: '#ffffffff',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: `${arrows.arrow3.top - arrows.arrow3.vertical}px`,
          left: `calc(38% - ${arrowOffsetX - arrows.arrow3.horizontal}px)`,
          width: `${arrows.arrow3.horizontal}px`,
          height: '1px',
          backgroundColor: '#ffffffff',
        }}
      />
      <ArrowHead
        top={-2 + arrows.arrow3.top - arrows.arrow3.vertical}
        left={70 - arrowOffsetX + arrows.arrow3.horizontal} // adjust for horizontal end
        direction="right"
      />
      <span
        style={{
          position: 'absolute',
          top: `${arrows.arrow3.top + arrows.arrow3.labelOffset}px`,
          left: `calc(50% - ${arrowOffsetX - arrows.arrow3.horizontal / 2}px)`,
          fontSize: '0.7rem',
          color: '#ffffffff',
        }}
      >
        {arrows.arrow3.label}
      </span>
    </>
  );
})()}

  </div>
</div>


        </div>

        <DragOverlay>{activeItem && <DraggableItem content={activeItem.content} />}</DragOverlay>
      </DndContext>

      <hr />
      <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'10px' }}>
        <button onClick={handleReset} className="primary-button" disabled={isSubmitting}>Buat Semula</button>
        <button onClick={checkAnswer} className="primary-button" disabled={isSubmitting || isCorrect}>
           {isSubmitting ? 'Menghantar...' : 'Semak Jawapan'}
        </button>
        <button 
          onClick={handleNext} 
          className="primary-button" 
          style={{ backgroundColor: isCorrect ? '#2ecc71' : '#999', opacity: isCorrect ? 1 : 0.5, cursor: isCorrect ? 'pointer' : 'not-allowed' }} 
          disabled={!isCorrect}
        >
          Seterusnya
        </button>
      </div>
    </div>
  );
}

export default Mission3_Pembinaan;
export default function HandStage() {
  const bones = [
    'M160,270 L128,250 L100,225 L80,200 L65,180',
    'M160,270 L135,190 L130,150 L127,115 L124,85',
    'M135,190 L162,180 L163,135 L164,95 L165,60',
    'M162,180 L188,185 L193,140 L197,102 L200,70',
    'M188,185 L212,195 L222,158 L230,128 L236,102',
    'M160,270 L212,195',
  ];
  const nodes = [[160,270],[128,250],[100,225],[80,200],[65,180],[135,190],[130,150],[127,115],[124,85],[162,180],[163,135],[164,95],[165,60],[188,185],[193,140],[197,102],[200,70],[212,195],[222,158],[230,128],[236,102]];

  function handleMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
    event.currentTarget.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  }

  return (
    <div className="hand-stage" onMouseMove={handleMove} onMouseLeave={(event) => { event.currentTarget.style.transform = 'rotateY(0) rotateX(0)'; }} aria-hidden="true">
      <svg viewBox="0 0 320 320">
        <defs><linearGradient id="boneGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7D94B5" /><stop offset="100%" stopColor="#C29591" /></linearGradient></defs>
        <g>{bones.map((bone) => <path className="bone" d={bone} key={bone} />)}</g>
        <g>{nodes.map(([cx, cy], index) => <circle className="node pulse-node" cx={cx} cy={cy} r={index === 0 ? 4 : 3} key={`${cx}-${cy}`} />)}</g>
      </svg>
      <div className="scanline" />
      <div className="hand-caption"><span className="live">21 landmarks tracked</span><span className="mono">A-Y classifier · local</span></div>
    </div>
  );
}

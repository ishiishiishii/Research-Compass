type VisualProps = {
  stepId: string
}

const DEMO_NODE_W = 108
const DEMO_NODE_H = 40

export function TutorialVisual({ stepId }: VisualProps) {
  return (
    <div className="flex h-48 items-center justify-center rounded-xl bg-slate-900/5 p-4">
      {stepId === 'welcome' && <WelcomeVisual />}
      {stepId === 'add-node' && <AddNodeVisual />}
      {stepId === 'connect' && <ConnectVisual />}
      {stepId === 'detail' && <DetailVisual />}
      {stepId === 'groups' && <GroupsVisual />}
      {stepId === 'done' && <DoneVisual />}
    </div>
  )
}

function WelcomeVisual() {
  return (
    <div className="tutorial-float flex flex-col items-center gap-3">
      <div className="flex gap-4">
        <DemoNode label="Word2Vec" delay={0} />
        <DemoNode label="Transformer" delay={0.3} />
        <DemoNode label="GPT-2" delay={0.6} />
      </div>
      <p className="text-xs text-slate-500">あなただけの研究地図</p>
    </div>
  )
}

function AddNodeVisual() {
  return (
    <div className="relative w-full max-w-xs">
      <div className="tutorial-fade-in rounded-lg border border-dashed border-indigo-400 bg-white px-4 py-2 text-sm text-indigo-600">
        + Transformer を追加
      </div>
      <div className="tutorial-pop-in absolute left-1/2 top-16 -translate-x-1/2">
        <DemoNode label="Transformer" />
      </div>
    </div>
  )
}

function ConnectVisual() {
  const gap = 56
  const totalWidth = DEMO_NODE_W * 2 + gap

  return (
    <div className="relative" style={{ width: totalWidth, height: DEMO_NODE_H }}>
      <div className="absolute left-0 top-0">
        <DemoNode label="Word2Vec" />
      </div>
      <div className="absolute top-0" style={{ left: DEMO_NODE_W + gap }}>
        <DemoNode label="Transformer" delay={0.5} />
      </div>
      <svg
        className="pointer-events-none absolute left-0 top-0 overflow-visible"
        width={totalWidth}
        height={DEMO_NODE_H}
        aria-hidden
      >
        <defs>
          <marker
            id="tutorial-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill="#6366f1" />
          </marker>
        </defs>
        <line
          x1={DEMO_NODE_W}
          y1={DEMO_NODE_H / 2}
          x2={DEMO_NODE_W + gap}
          y2={DEMO_NODE_H / 2}
          stroke="#6366f1"
          strokeWidth="2"
          markerEnd="url(#tutorial-arrow)"
          className="tutorial-draw-line"
        />
      </svg>
    </div>
  )
}

function DetailVisual() {
  return (
    <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-sm font-semibold">Transformer</div>
      <div className="mt-2 flex gap-1">
        {['◎', '○', '△', '×'].map((s, i) => (
          <span
            key={s}
            className={`tutorial-understanding rounded px-2 py-0.5 text-xs ${i === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {s}
          </span>
        ))}
      </div>
      <div className="tutorial-fade-in mt-2 h-8 rounded bg-slate-50 text-xs leading-8 text-slate-400">
        メモを入力...
      </div>
    </div>
  )
}

function GroupsVisual() {
  return (
    <div className="flex gap-3">
      <MemberCard name="あなた" graph="Transformer系" />
      <MemberCard name="田中" graph="GPT / RAG系" delay={0.4} />
    </div>
  )
}

function DoneVisual() {
  return (
    <div className="tutorial-pop-in text-5xl" aria-hidden>
      🧭
    </div>
  )
}

function DemoNode({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <div
      className="tutorial-pop-in flex items-center justify-center rounded-lg border-2 border-indigo-400 bg-white px-1 text-center text-xs font-medium shadow-sm"
      style={{
        animationDelay: `${delay}s`,
        width: DEMO_NODE_W,
        height: DEMO_NODE_H,
      }}
    >
      {label}
    </div>
  )
}

function MemberCard({
  name,
  graph,
  delay = 0,
}: {
  name: string
  graph: string
  delay?: number
}) {
  return (
    <div
      className="tutorial-fade-in w-28 rounded-lg border border-slate-200 bg-white p-2 text-center shadow-sm"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="text-xs font-medium text-slate-800">{name}</div>
      <div className="mt-1 text-[10px] text-slate-500">{graph}</div>
    </div>
  )
}

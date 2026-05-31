export type TutorialStep = {
  id: string
  title: string
  description: string
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Research Compass へようこそ',
    description:
      '論文・研究手法を地図（グラフ）として可視化し、学習メモや理解度を管理できるアプリです。ゼミメンバーと各自の論文図を共有できます。',
  },
  {
    id: 'add-node',
    title: 'ノードを追加する',
    description:
      '「+ ノード追加」から論文名や手法名を入力します。追加後はすぐにグラフ上に表示されます。',
  },
  {
    id: 'connect',
    title: 'ノード同士を結ぶ',
    description:
      '「2点選択」でノードを2回クリック、または「ドラッグ結線」で辺の中点から引いて結びます。線は辺の中点同士を結びます。不要な線はクリックで選択し、削除ボタンまたは Delete キーで消せます。',
  },
  {
    id: 'detail',
    title: '詳細・メモ・理解度',
    description:
      'ノードをクリックすると右側に詳細パネルが開きます。理解度（◎○△×）、関連/非関連、メモを編集して保存できます。背景をクリックまたは Esc で閉じられます。',
  },
  {
    id: 'groups',
    title: 'グループで共有',
    description:
      'グループを作成し招待コードを共有すると、メンバー各自の論文図を閲覧できます（編集は本人のみ）。',
  },
  {
    id: 'done',
    title: '準備完了！',
    description:
      'これで使い始められます。いつでもホームまたはヘッダーからチュートリアルを再表示できます。',
  },
]

const DONE_KEY = (userId: string) => `rc_tutorial_done_${userId}`
const SKIPPED_KEY = (userId: string) => `rc_tutorial_skipped_${userId}`

export function isTutorialFinished(userId: string): boolean {
  return (
    localStorage.getItem(DONE_KEY(userId)) === '1' ||
    localStorage.getItem(SKIPPED_KEY(userId)) === '1'
  )
}

export function markTutorialDone(userId: string): void {
  localStorage.setItem(DONE_KEY(userId), '1')
}

export function markTutorialSkipped(userId: string): void {
  localStorage.setItem(SKIPPED_KEY(userId), '1')
}

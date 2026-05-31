-- Demo seed: reinforcement learning sample graphs
-- Applied on db reset when profiles exist.

DO $$
DECLARE
  presenter_id uuid;
  tanaka_id uuid;
  g_id uuid;
  n_qlearning uuid;
  n_dqn uuid;
  n_ppo uuid;
  n_ddpg uuid;
  n_pg uuid;
  n_a2c uuid;
BEGIN
  SELECT id INTO presenter_id FROM public.profiles ORDER BY created_at LIMIT 1;
  IF presenter_id IS NULL THEN
    RETURN;
  END IF;

  -- Presenter graph: Q-learning → DQN → PPO, DDPG (non-relevant)
  IF NOT EXISTS (SELECT 1 FROM public.nodes WHERE user_id = presenter_id) THEN
    INSERT INTO public.nodes (user_id, title, year, summary, understanding, is_relevant, position_x, position_y)
    VALUES (presenter_id, 'Q-learning', 1989, '価値関数をテーブルで学習する基礎手法', 'good', true, 200, 80)
    RETURNING id INTO n_qlearning;

    INSERT INTO public.nodes (user_id, title, year, summary, problem, contribution, understanding, is_relevant, position_x, position_y)
    VALUES (
      presenter_id, 'DQN', 2015,
      'Deep Q-Network: CNN で Q 関数を近似',
      '高次元状態での Q 学習',
      'Experience Replay と Target Network',
      'good', true, 200, 220
    )
    RETURNING id INTO n_dqn;

    INSERT INTO public.nodes (user_id, title, year, summary, understanding, is_relevant, position_x, position_y)
    VALUES (presenter_id, 'PPO', 2017, 'Proximal Policy Optimization', 'partial', true, 200, 360)
    RETURNING id INTO n_ppo;

    INSERT INTO public.nodes (user_id, title, year, summary, understanding, is_relevant, position_x, position_y)
    VALUES (presenter_id, 'DDPG', 2015, 'Continuous control with deep RL', 'unset', false, 420, 220)
    RETURNING id INTO n_ddpg;

    INSERT INTO public.edges (user_id, source_node_id, target_node_id, label)
    VALUES
      (presenter_id, n_qlearning, n_dqn, 'extends'),
      (presenter_id, n_dqn, n_ppo, 'extends');

    INSERT INTO public.memos (node_id, user_id, content)
    VALUES (
      n_dqn,
      presenter_id,
      '{"confusion":"Target Network の更新タイミング","note":"発表用メモ: 理解度 ○"}'
    );
  END IF;

  -- Second user (Tanaka): Policy Gradient系
  SELECT id INTO tanaka_id FROM public.profiles ORDER BY created_at OFFSET 1 LIMIT 1;
  IF tanaka_id IS NOT NULL THEN
    UPDATE public.profiles SET display_name = '田中' WHERE id = tanaka_id;
  END IF;
  IF tanaka_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.nodes WHERE user_id = tanaka_id) THEN
    INSERT INTO public.nodes (user_id, title, year, summary, understanding, is_relevant, position_x, position_y)
    VALUES (tanaka_id, 'Policy Gradient', 1999, '方策勾配法の基礎', 'good', true, 180, 100)
    RETURNING id INTO n_pg;

    INSERT INTO public.nodes (user_id, title, year, summary, understanding, is_relevant, position_x, position_y)
    VALUES (tanaka_id, 'A2C', 2016, 'Advantage Actor-Critic', 'partial', true, 180, 240)
    RETURNING id INTO n_a2c;

    INSERT INTO public.edges (user_id, source_node_id, target_node_id, label)
    VALUES (tanaka_id, n_pg, n_a2c, 'extends');
  END IF;

  -- Demo group when 2+ users exist
  IF tanaka_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.groups WHERE name = '〇〇ゼミ 2026'
  ) THEN
    INSERT INTO public.groups (name, description, invite_code, created_by)
    VALUES ('〇〇ゼミ 2026', '論文発表ゼミ（デモ）', 'SEMI2026', presenter_id)
    RETURNING id INTO g_id;

    INSERT INTO public.group_members (group_id, user_id)
    VALUES (g_id, presenter_id), (g_id, tanaka_id)
    ON CONFLICT (group_id, user_id) DO NOTHING;
  END IF;
END $$;

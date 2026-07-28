'use client';

import { useSyncExternalStore } from 'react';

/**
 * 日程カード（SECTION 10）と申込フォーム（SECTION 15）を繋ぐ極小ストア。
 * 外部ライブラリを増やさずに、モジュールスコープの状態を React に購読させます。
 */
type EntryStoreState = {
  /** 日程カードから選択された開催日 ID */
  eventDateId: string;
  /** 「参加希望時間」へ視線を誘導するためのシグナル（インクリメントで発火） */
  focusSessionNonce: number;
};

let state: EntryStoreState = { eventDateId: '', focusSessionNonce: 0 };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

const SERVER_SNAPSHOT: EntryStoreState = { eventDateId: '', focusSessionNonce: 0 };
function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

/** 日程カードのボタンから呼ばれる：フォームの参加希望日を設定し、時間帯へ誘導する */
export function selectEventDate(eventDateId: string) {
  state = {
    eventDateId,
    focusSessionNonce: state.focusSessionNonce + 1,
  };
  emit();
}

export function useEntryStore(): EntryStoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

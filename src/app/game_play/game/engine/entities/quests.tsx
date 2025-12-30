export type Quest = {
    id: string;
    description: string,
    onStart?: () => void;
    onComplete?: () => void;
    isComplete: boolean;
}

export const QuestManager = {
    quests: [] as Quest[],
    currentIndex: 0,

    init(quests:Quest[]){
        this.quests = quests;
        this.currentIndex = 0;
    },
    getCurrent(): Quest | null {
        return this.quests[this.currentIndex] ?? null;
    },
    completeCurrent() {
        const q = this.getCurrent();
        if(!q) return;
        q.isComplete = true;
        q.onComplete?.();
        this.currentIndex++;
    }
}
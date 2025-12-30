export type PortalRef = {
    map: string;
    name?: string;
    questPortalId?: string,
    targetMap: string,
    active: boolean;
    ref: any;
}

export const PortalRegistry = {
    portalsByMap: {} as Record<string, PortalRef[]>,
    overrides: {} as Record<string, Record<string, boolean>>,
    pending: {} as Record<string, Record<string, boolean>>,

    register(map: string, portals: any[]) {
        this.portalsByMap[map] = portals.map(p => ({
            map,
            name: (p as any).name,
            questPortalId: (p as any).questPortalId,
            targetMap: p.targetMap,
            active: p.active,
            ref: p
        }));

        const ov = this.overrides[map];
        if(ov) {
            for( const key of Object.keys(ov)) {
                const portal = this.portalsByMap[map].find(pr => pr.questPortalId === key || pr.name === key);
                if(portal){
                    portal.ref.active = !!ov[key];
                }
            }
        }

        const pend = this.pending[map];
        if (pend) {
            for (const key of Object.keys(pend)) {
                const portal = this.portalsByMap[map].find(pr =>
                    pr.questPortalId === key || pr.name === key
                );
                if (portal) {
                    portal.ref.active = !!pend[key];
                    (this.overrides[map] ??= {})[key] = !!pend[key];
                }
            }
            delete this.pending[map];
        }
    },

    setPortalState(map: string, key: string, active: boolean) {
        (this.overrides[map] ??= {})[key] = !!active;
        const portals = this.portalsByMap[map];
        if (!portals) {
            (this.pending[map] ??= {})[key] = active;
            return;
        }
        const portal = portals.find(p => p.questPortalId === key || p.name === key);
        if (portal) {
            portal.ref.active = active;
        }
    },

    activatePortal(map: string, key: string) { this.setPortalState(map, key, true); },
    deactivatePortal(map: string, key: string) { this.setPortalState(map, key, false); },
};

export let eHandledThisPress = false;

export const setPressHandled = (v: boolean = true) => {
  eHandledThisPress = v;
};

export const resetPressHandled = () => {
  eHandledThisPress = false;
};

export const VirtualKeys = new Set<string|number>();
export function clearVirtualKeys() { VirtualKeys.clear(); }

export function pressKey(code: string) {
  VirtualKeys.add(code);
  switch (code) {
    case 'ArrowUp':    VirtualKeys.add(38); break;
    case 'ArrowDown':  VirtualKeys.add(40); break;
    case 'ArrowLeft':  VirtualKeys.add(37); break;
    case 'ArrowRight': VirtualKeys.add(39); break;
    case 'Action1':    VirtualKeys.add('KeyE'); break;
    case 'Action2':    VirtualKeys.add(70); break;
    case 'Action3':    VirtualKeys.add(69); break;
  }
}
export function releaseKey(code: string) {
  VirtualKeys.delete(code);
  switch (code) {
    case 'ArrowUp':    
        VirtualKeys.delete(38);
        eHandledThisPress = false;
        break;
    case 'ArrowDown':
        VirtualKeys.delete(40);
        eHandledThisPress = false;
        break;
    case 'ArrowLeft':
        VirtualKeys.delete(37);
        eHandledThisPress = false;
        break;
    case 'ArrowRight':
        VirtualKeys.delete(39);
        eHandledThisPress = false;
        break;
    case 'Action1':
        VirtualKeys.delete('KeyE');
        eHandledThisPress = false;
        break;
    case 'Action2':
        VirtualKeys.delete(70);
        eHandledThisPress = false;
        break;
    case 'Action3':
        VirtualKeys.delete(69);
        eHandledThisPress = false;
        break;
  }
}
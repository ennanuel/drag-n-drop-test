
import { MdCancel } from 'react-icons/md';
import { SelectedTab } from './constantsAndTypes';
import { IconType } from 'react-icons';
import { RxDrawingPin } from 'react-icons/rx';

type TabProps = {
    selectedTab: SelectedTab | null;
    tab: { title: string, Icon: IconType, isPinned: boolean };
    index: number;
    pathname: string;
    removeFromPinnedTabs: (index: number, title: string) => void;
    addToPinnedTabs: (index: number, title: string, dontNavigate?: boolean) => void;
    navigateToTab: (title: string) => void;
    start: React.MouseEventHandler<HTMLElement> & React.TouchEventHandler<HTMLElement>;
    end: () => void;
}

const Tab = ({ selectedTab, tab, index, pathname, removeFromPinnedTabs, addToPinnedTabs, start, end, navigateToTab }: TabProps) => {
    return (
        <li
            id={`${index}`}
            title={tab.title}
            className={`tab-container ${tab.isPinned ? 'pinned' : ''} relative ${(selectedTab?.nextTitle === tab.title && selectedTab.isBeingDragged) && (selectedTab?.isPinned === tab.isPinned ? 'next-tab' : 'forbidden')} ${index === selectedTab?.index && selectedTab.isBeingDragged && (tab.isPinned === selectedTab?.isPinned) ? 'dragging' : ''}`}
            onMouseDown={start}
            onMouseUp={end}
            onTouchStart={start}
            onTouchEnd={end}
        >
            <div className={`tab ${pathname.replace(/(\W|\s|\d)/ig, '').includes(tab.title.replace(/(\W|\s|\d)/ig, '')) && 'active'} relative flex items-center`}>
                <button onClick={() => tab.isPinned ? navigateToTab(tab.title) : addToPinnedTabs(index, tab.title)} className="title-icon flex flex-1 items-center">
                    <tab.Icon size={15} className="icon" />
                    <span className="flex-1">{tab.title}</span>
                </button>
                {
                    tab.isPinned ?
                        <button onClick={() => removeFromPinnedTabs(index, tab.title)} className="flex items-center justify-center close-btn">
                            <MdCancel size={15} />
                        </button> :
                        <button onClick={() => addToPinnedTabs(index, tab.title, true)} className="flex items-center justify-center close-btn">
                            <RxDrawingPin size={15} />
                        </button>
                }
            </div>
        </li>
    )
}

export default Tab

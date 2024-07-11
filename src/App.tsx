import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MdClose, MdKeyboardArrowDown } from 'react-icons/md';
import { IconType } from 'react-icons';
import { FiAlertTriangle } from 'react-icons/fi';

import DragBox from './DragBox';
import Tab from './Tab';

import { TABS, SelectedTab, TabDetails } from './constantsAndTypes';

import './App.css';

function getElementCoordinatesAndId(element: Element): TabDetails {
  const rect = element.getBoundingClientRect();
  const elementIsPinned = element.classList.contains('pinned');
  const index = Number(element.id);
  const title = String(element.getAttribute('title'));

  return { elementIsPinned, title, index, width: rect.width, xMin: rect.left, xMax: rect.width + rect.left, yMin: rect.top, yMax: rect.top + rect.height };
}

function Main() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const savedTabOrder = useMemo<{ pinned: number[]; unpinned: number[]; }>(() => {
    try {
      const tabsOrder = JSON.parse(String(localStorage.getItem('tabsOrder')));
      if (!tabsOrder) throw new Error('Nothing saved');
      return tabsOrder;
    } catch (error) {
      return { pinned: [], unpinned: [] };
    }
  }, []);

  function getTabs(tabType: 'pinned' | 'unpinned'): { id: number; title: string; Icon: IconType; isPinned: boolean; }[] {
    const tabs = Boolean(savedTabOrder.pinned.length) && Boolean(savedTabOrder.unpinned.length) ?
      TABS
        .filter(item => savedTabOrder[tabType].includes(item.id))
        .map(item => ({ ...item, isPinned: tabType === 'pinned' })) :
      TABS.filter(item => (tabType === 'unpinned' ? !item.isPinned : item.isPinned));
    
    return tabs;
  };

  function getTabCoordinates() {
    const tabElements = document.getElementsByClassName('tab-container');
    setTabCoordinates([...tabElements].map(getElementCoordinatesAndId))
  }

  const [showMoreTabs, setShowMoreTabs] = useState(true);

  const [pinnedTabs, setPinnedTabs] = useState(() => getTabs('pinned'));
  const [unpinnedTabs, setUnpinnedTabs] = useState(() => getTabs('unpinned'));

  const [tabCoordinates, setTabCoordinates] = useState<TabDetails[]>([]);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [delay, setDelay] = useState(0);
  const timeout = useRef<number>(0);

  const [tab, setTab] = useState<SelectedTab | null>(null);
  const [error, setError] = useState<string | null>(null);


  function navigateToTab(title: string) {
    navigate(`/${title}`);
  }

  function showError() {
    setError(`Cannot move ${tab?.isPinned ? 'pinned' : 'unpinned'} tab to ${tab?.isPinned ? 'unpinned' : 'pinned'} tabs`);
    setTimeout(clearError, 5000);
  }

  function clearError() {
    setError(null);
  }

  const getTabElement = ({ x, y }: { x: number; y: number }) => tabCoordinates.find(({ xMax, xMin, yMax, yMin }) => x > xMin && x <= xMax && y > yMin && y <= yMax);

  function addToPinnedTabs(index: number, title: string, dontNavigate?: boolean) {
    const newUnpinnedTabs = [...unpinnedTabs];
    const selectedTab = newUnpinnedTabs.splice(index, 1);
    if (selectedTab.length < 1) return;
    setPinnedTabs(prev => [...selectedTab, ...prev].map(tab => ({...tab, isPinned: true})));
    setUnpinnedTabs(newUnpinnedTabs);

    if (dontNavigate) return;
    navigateToTab(title);
  }


  function removeFromPinnedTabs(index: number, title: string) {
    const newPinnedTabs = [...pinnedTabs];
    const selectedTab = newPinnedTabs.splice(index, 1);
    setUnpinnedTabs(prev => [...prev, ...selectedTab].map(tab => ({ ...tab, isPinned: false })));
    setPinnedTabs(newPinnedTabs);

    if (pathname.replace(/(\W|\s|\d)/ig, '').includes(title.replace(/(\W|\s|\d)/ig, ''))) return;
    navigateToTab(newPinnedTabs[0]?.title || '');
  }


  const reorderTabs: React.SetStateAction<{ id: number; title: string; Icon: IconType; isPinned: boolean; }[]> = (prev) => {
    const tabs = [...prev];
    const currentTab = tabs.splice(Number(tab?.index), 1)
    if (currentTab.length < 1) return prev;
    tabs.splice(Number(tab?.nextIndex), 0, ...currentTab);
    return tabs;
  }

  
  function changePosition(event: Event ) {
    let x = 0, y = 0;

    if (event.type === 'mousemove' || event.type === 'mousedown') {
      x = (event as MouseEvent).clientX;
      y = (event as MouseEvent).clientY;
    } else if (event.type === 'touchmove' || event.type === 'touchstart') {
      const touch = (event as TouchEvent).touches || (event as TouchEvent).changedTouches;
      if (Boolean(touch?.length)) {
        x = touch[0].pageX;
        y = touch[0].pageY;
      }
    }

    return { x, y }
  }


  function initiateDrag(tabElement: TabDetails) {
    const { elementIsPinned, index, title, width } = tabElement;
    const selectedTab = tabElement.elementIsPinned ? pinnedTabs[index] : unpinnedTabs[index];

    if (!selectedTab) return;
    clearError();
    setTab({
      ...selectedTab,
      isPinned: elementIsPinned,
      index: index,
      nextTitle: title,
      nextIndex: index,
      width: width,
      canMove: true,
      isBeingDragged: delay > 0
    });
  }

  
  const start: React.TouchEventHandler<HTMLElement> & React.MouseEventHandler<HTMLElement> = (event) => { 
    const { x, y } = changePosition((event as unknown) as Event);
    const tabElement = getTabElement({ x, y });
    setPosition({ x, y });
    
    if (!tabElement) return;
    timeout.current = setTimeout(() => initiateDrag(tabElement), delay);
  };


  const handleMove = ({ x, y }: { x: number, y: number }) => {
    const tabElement = getTabElement({ x, y });
    if (!tab || !tabElement) {
      setTab(prev => prev && ({ ...prev, nextTitle: '' }));
    } else {
      const { index: nextIndex, title: nextTitle, elementIsPinned } = tabElement;
      if (elementIsPinned === tab.isPinned) setTab(prev => prev && ({ ...prev, nextIndex, nextTitle, canMove: true }));
      else setTab(prev => prev && ({ ...prev, nextIndex, nextTitle, canMove: false }));
    }
  }


  const end = () => { 
    reset();
    clearTimeout(timeout.current);

    if (!tab || !tab?.isBeingDragged) return;
    else if (!tab?.canMove) showError();
    else if (tab?.isPinned) setPinnedTabs(reorderTabs);
    else setUnpinnedTabs(reorderTabs);
  };
  
  const reset = () => setTab(null);

  useEffect(() => { 
    const pinned = pinnedTabs.map(tab => tab.id);
    const unpinned = unpinnedTabs.map(tab => tab.id);

    const order = { pinned, unpinned };
    localStorage.setItem('tabsOrder', JSON.stringify(order));

    getTabCoordinates();
  }, [pinnedTabs, unpinnedTabs])

  useEffect(() => { 

    const handleResize = () => {
      const isMobile = window.innerWidth <= 1024 && window.innerHeight <= 1366
      setDelay(isMobile ? 2000 : 0);
      getTabCoordinates();
    };

    const handleWindowMove = (event: MouseEvent | TouchEvent) => {
      const { x, y } = changePosition(event);
      const tabIsBeingDragged = Boolean(tab);
      setPosition({ x, y });
      setTab(prev => prev && { ...prev, isBeingDragged: tabIsBeingDragged });

      if (!tabIsBeingDragged) return;
      handleMove({ x, y });
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleWindowMove);
    window.addEventListener('touchmove', handleWindowMove);

    return () => {
      window.removeEventListener('mousemove', handleWindowMove);
      window.removeEventListener('touchmove', handleWindowMove);
      window.removeEventListener('resize', handleResize);
    }
  }, [tab])

  return (
    <div onMouseUp={reset} id="main" className="flex">
      <DragBox content={tab} position={position} tabIsBeingDragged={tab?.isBeingDragged} />
      <div className="left-bar"></div>

      <div className="right flex flex-col flex-1">
        <div className="top-bar"></div>
        <div className="tabs-container relative flex justify-between">
          <ul className="tabs flex flex-1">
            {
              pinnedTabs.map((pinnedTab, index) => (
                <Tab
                  navigateToTab={navigateToTab}
                  key={index}
                  index={index}
                  tab={pinnedTab}
                  selectedTab={tab}
                  pathname={pathname}
                  start={start}
                  end={end}
                  addToPinnedTabs={addToPinnedTabs}
                  removeFromPinnedTabs={removeFromPinnedTabs}
                />
              ))
            }
          </ul>
          {
            Boolean(unpinnedTabs.length) ?
              <div className="absolute more-tabs">
                <button onClick={() => setShowMoreTabs(!showMoreTabs)} className={`${showMoreTabs && 'active'} more-tabs-btn flex items-center justify-center`}>
                  <MdKeyboardArrowDown size={15} className="icon" />
                </button>
                {
                  showMoreTabs ?
                    <ul className="absolute unpinned-tabs flex flex-col flex flex-col">
                      {
                        unpinnedTabs.map((unpinnedTab, index) => (
                          <Tab
                            key={index}
                            index={index}
                            tab={unpinnedTab}
                            selectedTab={tab}
                            pathname={pathname}
                            navigateToTab={navigateToTab}
                            start={start}
                            end={end}
                            addToPinnedTabs={addToPinnedTabs}
                            removeFromPinnedTabs={removeFromPinnedTabs}
                          />
                        ))
                      }
                    </ul> :
                    null
                }
              </div> :
              null
          }
        </div>
        <div className="workspace relative flex flex-1">
          {
            error ?
              <div className="absolute error-msg flex items-start justify-center">
                <FiAlertTriangle size={13} />
                <span>{error}</span>
                <button onClick={clearError} className="flex items-center justify-center">
                  <MdClose size={15} />
                </button>
              </div> :
              null
          }
          <div className="board flex-1"></div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="*" element={<Main />} />
    </Routes>
  )
}

export default App

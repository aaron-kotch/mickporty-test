import React, { useEffect, useState } from "react";
import { InView } from 'react-intersection-observer';
import './Catalogs.scss'

export const CATALOG_LAYOUT = {
  GRID: "GRID",
  HORIZONTAL: "HORIZONTAL"
}

const LazyCatalogs = ({
  children,
  onCatalogInView = (index, element) => {},
}) => {
  const [catalogs, setCatalogs] = useState(children);
  const [visibleIndices, setVisibleIndices] = useState([]);

  const onInViewChanged = (index) => (inView, entry) => {
    if (inView) {
      setVisibleIndices(ind => [...ind, index]);
      onCatalogInView(index, entry.target);
    }
  };

  useEffect(() => {
    setCatalogs(children);
  }, [children])

  return (
    <div className='catalogs-container'>
      {
        catalogs.map((catalog, index) => {
          return (
            <InView
              key={catalog.props.id}
              id={catalog.props.id}
              className='catalogs-in_view_trigger'
              // triggerOnce
              rootMargin={"0px"}
              onChange={onInViewChanged(index)}
            >
              {
                visibleIndices.includes(index)
                ? catalog
                : <></>
              }
            </InView>
          )
        })
      }
    </div>
  )
}

export { LazyCatalogs };
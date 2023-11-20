import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { CircularProgress } from "@material-ui/core";
import './InfiniteScroller.scss'
import { CatalogHeader } from "@Common/Catalogs/CatalogHeader"
import { EmptyState } from "@Common/EmptyState/EmptyState";

const InfiniteScroller = ({
  hasNextPage,
  isNextPageLoading,
  component,
  loadNextPage = () => { },
  parentElement = null,
  debug = false,
  totalDataSize,
  bannerTitle = null
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [triggererRef, triggerInView] = useInView({
    rootMargin: "50%",
    root: parentElement
  });

  // const _debug = (message) => (debug) ? console.log(message) : undefined;
  useEffect(() => {
    // console.log(`Invoking callback loadNextPage with page of ${pageIndex}`);
    loadNextPage(pageIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  useEffect(() => {
    // console.log('triggered')
    if (triggerInView && !isNextPageLoading && hasNextPage)
      setPageIndex(p => {
        // console.log(`Setting next page to ${p + 1}`);
        return p + 1;
      });
  }, [hasNextPage, isNextPageLoading, triggerInView])

  return (
    <div>
      <div>
        {component}
      </div>
      {isNextPageLoading && <div className='infinite_scroller-loading_element'><CircularProgress /></div>}
      {totalDataSize === 0 && !isNextPageLoading &&
        <>
          <div style={{ padding: "0.25rem 0rem" }}>
            {bannerTitle && <CatalogHeader title={bannerTitle} onViewAll={null} />}
            <div style={{ paddingTop: "7rem" }}>
              <EmptyState description="No product available" />
            </div>
          </div>
        </>}
      {!isNextPageLoading && !hasNextPage && <p style={{ textAlign: "center" }}>{""}</p>}
      <div ref={triggererRef} style={{ width: "100%", height: 20, backgroundColor: debug ? "red" : "transparent" }} />
    </div>
  );
}

export { InfiniteScroller };
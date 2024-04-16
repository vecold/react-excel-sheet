
import { Dispatch } from '@zhenliang/sheet/hooks/useMiddlewareReducer';
import type { SheetType } from '@zhenliang/sheet/type';
import { pick } from 'lodash';
import { useCallback, useEffect } from 'react';
export const useSearchInput = (
    state: Partial<SheetType.UpdateStateType>,
    dispatch: Dispatch,
    handlerRef: React.RefObject<SheetType.SheetInstance>,
) => {
    const goSearchResult = useCallback((value: number) => {
        const { searchTotal = 0 } = state
        const index = (value < 0 ? value + searchTotal : value) % (searchTotal || 1)
        const result = state.searchResultList?.[index]
        if (result) {
            state.eventBus?.emit('group-open-title', true);
            dispatch({ type: 'changes', payload: { searchCurrent: index } })
            handlerRef.current?.select({ start: result, end: result })
            handlerRef?.current?.zoomTo()
        }
    }, [state.searchTotal, state.searchResultList])

    const goNext = useCallback(() => {
        goSearchResult((state.searchCurrent ?? 0) + 1)
    }, [goSearchResult, state.searchCurrent])
    const goLast = useCallback(() => {
        goSearchResult((state.searchCurrent ?? 0) - 1)
    }, [goSearchResult, state.searchCurrent])

    const closeSearch = useCallback(() => {
        dispatch({ type: 'closeSearch' })
    }, [])
    const changeSearch = useCallback((value: string) => {
        dispatch({ type: 'changeSearch', payload: value })
    }, [state.data])

    useEffect(() => {
        if (!state.searchResultList?.length) {
            dispatch({ type: 'clearSelect' })
        }

    }, [state.searchResultList, state.searchTotal])


    return {
        ...pick(state, ['searchText', 'searchTotal', 'searchCurrent',]),
        goNext,
        goLast, changeSearch, closeSearch
    }

}
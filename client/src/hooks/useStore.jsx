import { useContext } from 'react';
import Context from '../store/Context';

export const useStore = () => {
    return useContext(Context);
};

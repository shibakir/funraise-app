import { debounce } from '@/lib/utilities/debounce';

describe('debounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should call function after specified delay', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 500);

        debouncedFn('test');
        expect(mockFn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(500);
        expect(mockFn).toHaveBeenCalledWith('test');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous call when called again', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 500);

        debouncedFn('first');
        jest.advanceTimersByTime(300);

        debouncedFn('second');
        jest.advanceTimersByTime(300);

        expect(mockFn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(200);
        expect(mockFn).toHaveBeenCalledWith('second');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call function only once when called multiple times', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 300);

        debouncedFn('call1');
        debouncedFn('call2');
        debouncedFn('call3');
        debouncedFn('call4');

        jest.advanceTimersByTime(300);

        expect(mockFn).toHaveBeenCalledWith('call4');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should work with different argument types', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 100);

        const testObject = { id: 1, name: 'test' };
        debouncedFn(testObject, 'string', 123);

        jest.advanceTimersByTime(100);

        expect(mockFn).toHaveBeenCalledWith(testObject, 'string', 123);
    });

    it('should work with functions without arguments', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 200);

        debouncedFn();
        jest.advanceTimersByTime(200);

        expect(mockFn).toHaveBeenCalledWith();
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should work with zero delay', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 0);

        debouncedFn('immediate');
        jest.advanceTimersByTime(0);

        expect(mockFn).toHaveBeenCalledWith('immediate');
    });
}); 
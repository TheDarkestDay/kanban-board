import { describe, expect, it } from 'vitest';

import { dragItemTo } from './DraggableList';

describe('dragItemTo', () => {
    describe('placing before', () => {
        it('should drag element from lower index to greater', () => {
            const items = ['John', 'Bob', 'Alice'];
    
            const newItems = dragItemTo(items, 0, 1, 'before');
    
            expect(newItems).toEqual(['John', 'Bob', 'Alice']);
        });
    
        it('should drag element from greater index to lower', () => {
            const items = ['John', 'Bob', 'Alice'];
    
            const newItems = dragItemTo(items, 2, 1, 'before');
    
            expect(newItems).toEqual(['John', 'Alice', 'Bob']);
        });
    
        it('should drag element to the beginning of a list', () => {
            const items = ['John', 'Bob', 'Alice'];
    
            const newItems = dragItemTo(items, 2, 0, 'before');
    
            expect(newItems).toEqual(['Alice', 'John', 'Bob']);
        });
    });

    describe('placing after', () => {
        it('should drag element from lower index to greater', () => {
            const items = ['John', 'Bob', 'Alice'];
    
            const newItems = dragItemTo(items, 0, 1, 'after');
    
            expect(newItems).toEqual(['Bob', 'John', 'Alice']);
        });
    
        it('should drag element from greater index to lower', () => {
            const items = ['John', 'Bob', 'Alice'];
    
            const newItems = dragItemTo(items, 2, 1, 'after');
    
            expect(newItems).toEqual(['John', 'Bob', 'Alice']);
        });
    
        it('should drag element to the end of a list', () => {
            const items = ['John', 'Bob', 'Alice'];
    
            const newItems = dragItemTo(items, 0, 2, 'after');
    
            expect(newItems).toEqual(['Bob', 'Alice', 'John']);
        });
    });
});
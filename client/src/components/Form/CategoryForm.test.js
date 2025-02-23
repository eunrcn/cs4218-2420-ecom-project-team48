import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryForm from './CategoryForm';
import '@testing-library/jest-dom';

describe('CategoryForm Component', () => {
    const mockSetValue = jest.fn();
    const mockHandleSubmit = jest.fn(e => e.preventDefault());

    const renderComponent = (props = {}) => {
        render(
            <CategoryForm
                handleSubmit={mockHandleSubmit}
                value=""
                setValue={mockSetValue}
                {...props}
            />
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders basic form elements', () => {
        renderComponent();

        expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument();

        expect(screen.getByRole('button', {
            name: /submit/i
        })).toBeInTheDocument();
    });

    test('displays initial value correctly', () => {
        const initialValue = 'Test Category';
        renderComponent({ value: initialValue });

        const input = screen.getByDisplayValue(initialValue);
        expect(input).toBeInTheDocument();
    });

    test('updates value on input change', () => {
        renderComponent();

        const input = screen.getByPlaceholderText('Enter new category');
        const testValue = 'Furniture';

        fireEvent.change(input, { target: { value: testValue } });

        expect(mockSetValue).toHaveBeenCalledWith(testValue);
    });

    test('submits form on button click', () => {
        renderComponent();

        const button = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(button);

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
    });
});
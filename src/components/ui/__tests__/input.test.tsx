import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter name" />);
      expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    });

    it('should render with default type text', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      // En happy-dom, si no se especifica type, puede ser null o 'text'
      expect(input?.type === 'text' || input?.type === '').toBe(true);
    });
  });

  describe('Types', () => {
    it('should render email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should render number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render date input', () => {
      render(<Input type="date" />);
      const input = document.querySelector('input[type="date"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should be readonly when readOnly prop is true', () => {
      render(<Input readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should accept value prop', () => {
      render(<Input value="Test value" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Test value');
    });

    it('should accept defaultValue prop', () => {
      render(<Input defaultValue="Default" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Default');
    });
  });

  describe('Interactions', () => {
    it('should call onChange when typing', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value when typing', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'Test input');
      expect(input.value).toBe('Test input');
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should accept required attribute', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('should accept maxLength attribute', () => {
      render(<Input maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should accept pattern attribute', () => {
      render(<Input pattern="[0-9]*" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('should accept id prop', () => {
      render(<Input id="email-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('should accept name prop', () => {
      render(<Input name="username" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('should support aria-label', () => {
      render(<Input aria-label="Search" />);
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="error-msg" />
          <span id="error-msg">Error message</span>
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'error-msg');
    });

    it('should not be focusable when disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).not.toHaveFocus();
    });
  });

  describe('Styling', () => {
    it('should have base styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex', 'w-full', 'rounded-md', 'border');
    });

    it('should have focus styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('should have disabled styles', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });
});

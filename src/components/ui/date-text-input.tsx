import * as React from "react";

import { texts } from "@/texts";
import type { DateTextInputProps } from "@/types/components/ui/date-text-input-props";

import { displayToIso, isoToDisplay, maskDate } from "@/lib/date-input";

import { Input } from "./input";

/**
 * Campo de data que abre o teclado numérico no celular, no lugar do `type="date"` nativo (que no
 * Chrome do Android só deixa escolher pelo calendário). Mostra dd/mm/aaaa e trabalha em ISO.
 *
 * Com `name`, um input oculto leva o ISO no FormData, então serve também em formulário não controlado.
 */
export const DateTextInput = React.forwardRef<HTMLInputElement, DateTextInputProps>(
  ({ value, defaultValue, onValueChange, name, min, max, required, ...props }, ref) => {
    const [display, setDisplay] = React.useState(() => isoToDisplay(value ?? defaultValue));
    const iso = displayToIso(display);
    const emitted = (text: string) => (text ? displayToIso(text) || text : "");

    // Valor controlado mudou por fora (ex.: perfil carregado): espelha no campo.
    React.useEffect(() => {
      if (value !== undefined && value !== emitted(display)) {
        setDisplay(isoToDisplay(value));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const validity = (() => {
      if (!display) return "";
      if (!iso) return texts.dateInput.invalid;
      if ((min && iso < min) || (max && iso > max)) return texts.dateInput.outOfRange;
      return "";
    })();

    const innerRef = React.useRef<HTMLInputElement | null>(null);
    React.useEffect(() => {
      innerRef.current?.setCustomValidity(validity);
    }, [validity]);

    return (
      <>
        <Input
          {...props}
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={props.autoComplete ?? "off"}
          placeholder={props.placeholder ?? texts.dateInput.placeholder}
          maxLength={undefined}
          required={required}
          value={display}
          onChange={(event) => {
            const next = maskDate(event.target.value);
            setDisplay(next);
            onValueChange?.(emitted(next));
          }}
        />
        {name && <input type="hidden" name={name} value={iso} />}
      </>
    );
  },
);
DateTextInput.displayName = "DateTextInput";

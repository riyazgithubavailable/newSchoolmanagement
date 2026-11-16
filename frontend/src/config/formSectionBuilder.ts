import React from "react";

export type FormFieldType =
    | "text"
    | "number"
    | "email"
    | "password"
    | "date"
    | "datetime-local"
    | "textarea"
    | "select"
    | "checkbox"
    | "custom";

export type FieldOption = {
    label: string;
    value: string | number;
};

export type ValidationRule<TForm = Record<string, any>> = (
    value: any,
    formValues: TForm
) => string | null;

export interface FormFieldConfig<TForm = Record<string, any>> {
    name: keyof TForm | string;
    label: string;
    type: FormFieldType;

    placeholder?: string;
    disabled?: boolean;
    required?: boolean;

    options?: FieldOption[];

    className?: string;
    inputClassName?: string;
    colSpan?: 1 | 2 | 3 | 4;

    min?: string | number;
    max?: string | number;
    step?: string | number;

    defaultValue?: any;

    validate?: ValidationRule<TForm>[];
    render?: (params: {
        value: any;
        error?: string;
        formValues: TForm;
        onChange: (value: any) => void;
    }) => React.ReactNode;
}

export interface FormSectionConfig<TForm = Record<string, any>> {
    key: string;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
    fields: FormFieldConfig<TForm>[];
    className?: string;
}

export function getGridCols(columns: 1 | 2 | 3 | 4 = 2) {
    switch (columns) {
        case 1:
            return "grid grid-cols-1 gap-4";
        case 3:
            return "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3";
        case 4:
            return "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4";
        case 2:
        default:
            return "grid grid-cols-1 gap-4 md:grid-cols-2";
    }
}

export function getColSpanClass(colSpan: 1 | 2 | 3 | 4 = 1) {
    switch (colSpan) {
        case 2:
            return "md:col-span-2";
        case 3:
            return "xl:col-span-3";
        case 4:
            return "xl:col-span-4";
        default:
            return "";
    }
}

export function buildInitialValues<TForm = Record<string, any>>(
    sections: FormSectionConfig<TForm>[],
    source?: Partial<TForm>
): TForm {
    const result: Record<string, any> = {};

    sections.forEach((section) => {
        section.fields.forEach((field) => {
            const key = String(field.name);
            const sourceValue = source?.[field.name as keyof TForm];

            if (sourceValue !== undefined) {
                result[key] = sourceValue;
            } else if (field.defaultValue !== undefined) {
                result[key] = field.defaultValue;
            } else if (field.type === "checkbox") {
                result[key] = false;
            } else {
                result[key] = "";
            }
        });
    });

    return result as TForm;
}

export function validateFormSections<TForm = Record<string, any>>(
    sections: FormSectionConfig<TForm>[],
    formValues: TForm
) {
    const errors: Record<string, string> = {};

    sections.forEach((section) => {
        section.fields.forEach((field) => {
            const key = String(field.name);
            const value = (formValues as Record<string, any>)[key];

            if (
                field.required &&
                (value === "" || value === null || value === undefined)
            ) {
                errors[key] = `${field.label} Is Required`;
                return;
            }

            if (field.validate?.length) {
                for (const rule of field.validate) {
                    const message = rule(value, formValues);
                    if (message) {
                        errors[key] = message;
                        break;
                    }
                }
            }
        });
    });

    return errors;
}

export const validators = {
    required:
        <TForm = Record<string, any>>(label: string): ValidationRule<TForm> =>
            (value) =>
                value === "" || value === null || value === undefined
                    ? `${label} Is Required`
                    : null,

    minLength:
        <TForm = Record<string, any>>(label: string, min: number): ValidationRule<TForm> =>
            (value) =>
                value && String(value).length < min
                    ? `${label} Must Be At Least ${min} Characters`
                    : null,

    maxLength:
        <TForm = Record<string, any>>(label: string, max: number): ValidationRule<TForm> =>
            (value) =>
                value && String(value).length > max
                    ? `${label} Must Be At Most ${max} Characters`
                    : null,

    positiveNumber:
        <TForm = Record<string, any>>(label: string): ValidationRule<TForm> =>
            (value) =>
                value !== "" && Number(value) < 0 ? `${label} Must Be Positive` : null,

    dateAfter:
        <TForm = Record<string, any>>(
            label: string,
            compareField: keyof TForm | string,
            compareLabel: string
        ): ValidationRule<TForm> =>
            (value, formValues) => {
                if (!value || !(formValues as Record<string, any>)[String(compareField)]) {
                    return null;
                }

                const current = new Date(value);
                const compare = new Date(
                    (formValues as Record<string, any>)[String(compareField)]
                );

                if (current < compare) {
                    return `${label} Cannot Be Earlier Than ${compareLabel}`;
                }

                return null;
            },
};

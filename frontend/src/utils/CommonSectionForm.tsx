import React from "react";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
    FormSectionConfig,
    getColSpanClass,
    getGridCols,
} from "@/config/formSectionBuilder.ts";
import DateInputField from "@/utils/DateInputField";

type ChangeValue = string | number | boolean | undefined;

type Props<TForm> = {
    sections: FormSectionConfig<TForm>[];
    formValues: TForm;
    errors?: Record<string, string>;
    onChange: (name: string, value: ChangeValue) => void;
};

function isInputValue(value: unknown): value is string | number {
    return typeof value === "string" || typeof value === "number";
}

function isFieldConstraint(value: unknown): value is string | number {
    return typeof value === "string" || typeof value === "number";
}

export default function CommonSectionForm<TForm>({
    sections,
    formValues,
    errors = {},
    onChange,
}: Props<TForm>) {

    return (
        <div className="space-y-6">
            {sections.map((section) => (
                <Card
                    key={section.key}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-950/70"
                >
                    <CardContent className="p-5 md:p-6 ">
                        <div className="mb-5 flex items-start gap-3">
                            {section.icon ? (
                                <div
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary dark:border-primary/20 dark:bg-primary/15">
                                    {section.icon}
                                </div>
                            ) : null}

                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    {section.title}
                                </h3>

                                {section.subtitle ? (
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        {section.subtitle}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className={`${getGridCols(section.columns)} md:items-end lg:items-stretch`}>
                            {section.fields.map((field) => {
                                const name = String(field.name);
                                const value = (formValues as Record<string, unknown>)[name];
                                const error = errors[name];

                                return (
                                    <div
                                        key={name}
                                        className={`${getColSpanClass(field.colSpan)} flex flex-col justify-end`}
                                    >
                                        {field.type === "custom" && field.render ? (
                                            field.render({
                                                value,
                                                error,
                                                formValues,
                                                onChange: (val) => onChange(name, val as ChangeValue),
                                            })
                                        ) : (
                                            <>
                                                {field.type !== "checkbox" && field.type !== "date" ? (
                                                    <Label className="mb-2 block font-semibold text-foreground">
                                                        {field.label.replace(/\s*\*$/, "")}
                                                        {field.required && (
                                                            <span className="ml-1 text-red-500">*</span>
                                                        )}
                                                    </Label>
                                                ) : null}

                                                {(field.type === "text" ||
                                                    field.type === "number" ||
                                                    field.type === "email" ||
                                                    field.type === "password" ||
                                                    field.type === "datetime-local") ? (

                                                    <Input
                                                        type={field.type}
                                                        value={isInputValue(value) ? value : ""}
                                                        placeholder={field.placeholder}
                                                        disabled={field.disabled}
                                                        min={isFieldConstraint(field.min) ? field.min : undefined}
                                                        max={isFieldConstraint(field.max) ? field.max : undefined}
                                                        step={isFieldConstraint(field.step) ? field.step : undefined}
                                                        onChange={(e) => onChange(name, e.target.value)}
                                                        className={field.inputClassName}
                                                    />
                                                ) : null}

                                                {field.type === "date" ? (
                                                    <DateInputField
                                                        label={field.label}
                                                        value={typeof value === "string" ? value : ""}
                                                        onChange={(v) => onChange(name, v)}
                                                        disabled={field.disabled}
                                                        min={typeof field.min === "string" ? field.min : undefined}
                                                        max={typeof field.max === "string" ? field.max : undefined}
                                                        required={field.required}
                                                        inputClassName={field.inputClassName}
                                                    />
                                                ) : null}

                                                {field.type === "textarea" ? (
                                                    <Textarea
                                                        value={typeof value === "string" ? value : ""}
                                                        placeholder={field.placeholder}
                                                        disabled={field.disabled}
                                                        onChange={(e) => onChange(name, e.target.value)}
                                                        className={field.inputClassName}
                                                    />
                                                ) : null}

                                                {field.type === "select" ? (
                                                    <Select
                                                        value={typeof value === "string" ? value : ""}
                                                        onValueChange={(v) => onChange(name, v)}
                                                        disabled={field.disabled}
                                                    >
                                                        <SelectTrigger className={field.inputClassName}>
                                                            <SelectValue
                                                                placeholder={
                                                                    field.placeholder || `Select ${field.label}`
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {field.options?.map((option) => (
                                                                <SelectItem
                                                                    key={String(option.value)}
                                                                    value={String(option.value)}
                                                                >
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : null}

                                                {field.type === "checkbox" ? (
                                                    <div className="flex items-center gap-3 pt-8">
                                                        <Checkbox
                                                            checked={Boolean(value)}
                                                            onCheckedChange={(checked) =>
                                                                onChange(name, Boolean(checked))
                                                            }
                                                        />
                                                        <Label className="font-semibold text-foreground">
                                                            {field.label}
                                                        </Label>
                                                    </div>
                                                ) : null}
                                                <div className="mt-1 min-h-[20px]">
                                                    {error && (
                                                        <p className="text-xs font-medium text-red-500">
                                                            {error}
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
import { useCallback, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";

type EmployeePhotoData = {
    plantEmployeeId: number;
    employeePhotoBase64: string;
};

type EmployeePhotoResponse = {
    success: boolean;
    data: EmployeePhotoData;
};

type State = {
    loading: boolean;
    error: string | null;
    photo: EmployeePhotoData | null;
};

export function useEmployeePhoto() {
    const [state, setState] = useState<State>({
        loading: false,
        error: null,
        photo: null,
    });

    const abortRef = useRef<AbortController | null>(null);

    const fetchEmployeePhoto = useCallback(
        async (plantEmployeeId: number) => {
            abortRef.current?.abort();

            const controller = new AbortController();
            abortRef.current = controller;

            setState((prev) => ({
                ...prev,
                loading: true,
                error: null,
            }));
   
            try {
                const res = await apiRequest<EmployeePhotoResponse>(
                    `/PlantEmployee/GetEmployeePhoto/${plantEmployeeId}`,
                    {
                        method: "GET",
                        signal: controller.signal,
                    }
                );
                setState({
                    loading: false,
                    error: null,
                    photo: res?.data || null,
                });

                return res?.data || null;
            } catch (error: any) {
                if (error.name === "AbortError") return;

                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error:
                        error?.message ||
                        "Failed to fetch employee photo",
                }));

                console.error("Photo fetch error:", error);
                throw error;
            }
        },
        []
    );

    return {
        ...state,
        fetchEmployeePhoto,
    };
}
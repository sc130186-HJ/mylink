"use client";

import React, { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileInfo } from "@/types/profile";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCircle2,
} from "lucide-react";
import { checkDisplayNameDuplicate } from "@/lib/firestore";

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────
const MAX_NAME_LENGTH = 20;
const MIN_NAME_LENGTH = 2;
const MAX_ROLE_LENGTH = 20;
const MAX_BIO_LENGTH = 100;
const MAX_STATUS_LENGTH = 40;

// ─────────────────────────────────────────────
// 중복 확인 상태 타입
// ─────────────────────────────────────────────
type DuplicateStatus = "idle" | "checking" | "available" | "taken";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: ProfileInfo;
  currentUserId: string;
  onSave: (updatedProfile: ProfileInfo) => Promise<void> | void;
  isLoading?: boolean;
}

// ─────────────────────────────────────────────
// 내부 폼 컴포넌트
// ─────────────────────────────────────────────
interface EditProfileFormProps {
  currentProfile: ProfileInfo;
  currentUserId: string;
  onClose: () => void;
  onSave: (updatedProfile: ProfileInfo) => Promise<void> | void;
  isLoading?: boolean;
}

function EditProfileForm({
  currentProfile,
  currentUserId,
  onClose,
  onSave,
  isLoading = false,
}: EditProfileFormProps) {
  const [name, setName] = useState(currentProfile.name);
  const [role, setRole] = useState(currentProfile.role);
  const [bio, setBio] = useState(currentProfile.bio);
  const [statusMessage, setStatusMessage] = useState(
    currentProfile.statusMessage || ""
  );

  // 중복 확인 상태
  const [duplicateStatus, setDuplicateStatus] =
    useState<DuplicateStatus>("idle");
  // 이름이 현재와 같으면 중복 확인 불필요
  const isNameChanged = name.trim() !== currentProfile.name.trim();

  // 에러 상태
  const [errors, setErrors] = useState<{
    name?: string;
    role?: string;
    bio?: string;
    statusMessage?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // ── 유효성 검사 ──
  const validateName = (val: string): string | undefined => {
    const trimmed = val.trim();
    if (!trimmed) return "표시 이름을 입력해 주세요";
    if (trimmed.length < MIN_NAME_LENGTH)
      return `표시 이름은 ${MIN_NAME_LENGTH}자 이상 입력해 주세요`;
    if (val.length > MAX_NAME_LENGTH)
      return `표시 이름은 ${MAX_NAME_LENGTH}자 이내로 입력해 주세요`;
    return undefined;
  };

  const validateRole = (val: string): string | undefined => {
    if (val.length > MAX_ROLE_LENGTH)
      return `직무는 ${MAX_ROLE_LENGTH}자 이내로 입력해 주세요`;
    return undefined;
  };

  const validateBio = (val: string): string | undefined => {
    if (val.length > MAX_BIO_LENGTH)
      return `소개글은 ${MAX_BIO_LENGTH}자 이내로 입력해 주세요`;
    return undefined;
  };

  const validateStatus = (val: string): string | undefined => {
    if (val.length > MAX_STATUS_LENGTH)
      return `상태 메시지는 ${MAX_STATUS_LENGTH}자 이내로 입력해 주세요`;
    return undefined;
  };

  // ── 핸들러 ──
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setDuplicateStatus("idle");
    setErrors((prev) => ({ ...prev, name: validateName(val) }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRole(val);
    setErrors((prev) => ({ ...prev, role: validateRole(val) }));
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setBio(val);
    setErrors((prev) => ({ ...prev, bio: validateBio(val) }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStatusMessage(val);
    setErrors((prev) => ({ ...prev, statusMessage: validateStatus(val) }));
  };

  // ── 중복 확인 (TanStack Query useMutation) ──
  const duplicateCheckMutation = useMutation({
    mutationFn: (targetName: string) =>
      checkDisplayNameDuplicate(targetName, currentUserId),
    onMutate: () => {
      setDuplicateStatus("checking");
    },
    onSuccess: (isDuplicate) => {
      setDuplicateStatus(isDuplicate ? "taken" : "available");
    },
    onError: () => {
      setDuplicateStatus("idle");
    },
  });

  const handleCheckDuplicate = () => {
    const nameError = validateName(name);
    if (nameError) {
      setErrors((prev) => ({ ...prev, name: nameError }));
      nameInputRef.current?.focus();
      return;
    }
    duplicateCheckMutation.mutate(name.trim());
  };

  // ── 저장하기 ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    // 전체 유효성 검사
    const nameError = validateName(name);
    const roleError = validateRole(role);
    const bioError = validateBio(bio);
    const statusError = validateStatus(statusMessage);

    const newErrors = {
      name: nameError,
      role: roleError,
      bio: bioError,
      statusMessage: statusError,
    };
    setErrors(newErrors);

    if (nameError) {
      nameInputRef.current?.focus();
      return;
    }
    if (roleError || bioError || statusError) return;

    // 이름이 변경됐는데 중복 확인을 안 했으면 차단
    if (isNameChanged && duplicateStatus !== "available") {
      setErrors((prev) => ({
        ...prev,
        name: "표시 이름 중복 확인이 필요해요",
      }));
      nameInputRef.current?.focus();
      return;
    }

    // 이름이 중복인 경우 차단
    if (duplicateStatus === "taken") {
      setErrors((prev) => ({
        ...prev,
        name: "이미 사용 중인 이름이에요",
      }));
      nameInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProfile: ProfileInfo = {
        ...currentProfile,
        name: name.trim(),
        role: role.trim() || currentProfile.role,
        bio: bio.trim(),
        statusMessage: statusMessage.trim() || undefined,
      };
      await onSave(updatedProfile);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isLoading;

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
      {/* 1. 표시 이름 (Display Name) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-semibold text-[#4E5968]">
            표시 이름 *
          </label>
          <span
            className={`text-[11px] tabular-nums font-medium ${
              name.length > MAX_NAME_LENGTH ? "text-[#F04452]" : "text-[#8B95A1]"
            }`}
          >
            {name.length}/{MAX_NAME_LENGTH}자
          </span>
        </div>

        {/* 이름 입력 + 중복 확인 버튼 inline */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              ref={nameInputRef}
              value={name}
              onChange={handleNameChange}
              placeholder="2~20자 이내로 입력해 주세요"
              error={!!errors.name}
              disabled={isBusy}
            />
          </div>
          <Button
            type="button"
            variant={duplicateStatus === "available" ? "subtle" : "secondary"}
            size="s"
            onClick={handleCheckDuplicate}
            disabled={
              isBusy ||
              duplicateStatus === "checking" ||
              !isNameChanged ||
              !!validateName(name)
            }
            className="shrink-0 h-11 px-3 text-[12px] font-semibold rounded-[12px]"
          >
            {duplicateStatus === "checking" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "중복 확인"
            )}
          </Button>
        </div>

        {/* 중복 확인 결과 메시지 */}
        {duplicateStatus === "available" && (
          <p className="text-[12px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>사용 가능한 이름이에요</span>
          </p>
        )}
        {duplicateStatus === "taken" && (
          <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1 font-medium">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>이미 사용 중인 이름이에요</span>
          </p>
        )}
        {errors.name && duplicateStatus !== "taken" && (
          <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.name}</span>
          </p>
        )}
        {/* 이름 미변경 안내 */}
        {!isNameChanged && (
          <p className="text-[11px] text-[#8B95A1] mt-0.5">
            이름을 변경하면 중복 확인이 필요해요
          </p>
        )}
      </div>

      {/* 2. 직무 (Role) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-semibold text-[#4E5968] flex items-center gap-1.5">
            <span>직무</span>
            <span className="text-[11px] text-[#8B95A1] font-normal">선택</span>
          </label>
          <span
            className={`text-[11px] tabular-nums font-medium ${
              role.length > MAX_ROLE_LENGTH ? "text-[#F04452]" : "text-[#8B95A1]"
            }`}
          >
            {role.length}/{MAX_ROLE_LENGTH}자
          </span>
        </div>
        <Input
          value={role}
          onChange={handleRoleChange}
          placeholder="예: 프론트엔드 개발자"
          error={!!errors.role}
          disabled={isBusy}
        />
        {errors.role && (
          <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.role}</span>
          </p>
        )}
      </div>

      {/* 3. 한 줄 소개 (Bio) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-semibold text-[#4E5968] flex items-center gap-1.5">
            <span>한 줄 소개</span>
            <span className="text-[11px] text-[#8B95A1] font-normal">선택</span>
          </label>
          <span
            className={`text-[11px] tabular-nums font-medium ${
              bio.length > MAX_BIO_LENGTH ? "text-[#F04452]" : "text-[#8B95A1]"
            }`}
          >
            {bio.length}/{MAX_BIO_LENGTH}자
          </span>
        </div>
        <textarea
          value={bio}
          onChange={handleBioChange}
          placeholder="나를 소개하는 한 줄을 입력해 주세요"
          rows={3}
          disabled={isBusy}
          className={`w-full px-3.5 py-3 rounded-[12px] bg-[#F9FAFB] border text-[14px] text-[#191F28] resize-none focus:bg-white focus:border-[#3182F6] focus:ring-3 focus:ring-[#3182F6]/15 outline-none transition-all placeholder:text-[#B0B8C1] ${
            errors.bio ? "border-[#F04452] bg-[#FFF0F1]" : "border-[#E5E8EB]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {errors.bio && (
          <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.bio}</span>
          </p>
        )}
      </div>

      {/* 4. 상태 메시지 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-semibold text-[#4E5968] flex items-center gap-1.5">
            <span>상태 메시지</span>
            <span className="text-[11px] text-[#8B95A1] font-normal">선택</span>
          </label>
          <span
            className={`text-[11px] tabular-nums font-medium ${
              statusMessage.length > MAX_STATUS_LENGTH
                ? "text-[#F04452]"
                : "text-[#8B95A1]"
            }`}
          >
            {statusMessage.length}/{MAX_STATUS_LENGTH}자
          </span>
        </div>
        <Input
          value={statusMessage}
          onChange={handleStatusChange}
          placeholder="예: 온라인 · 개발 중이에요 🚀"
          error={!!errors.statusMessage}
          disabled={isBusy}
        />
        {errors.statusMessage && (
          <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.statusMessage}</span>
          </p>
        )}
      </div>

      {/* 액션 버튼 */}
      <DialogFooter className="mt-5 pt-1 flex flex-row gap-2">
        <Button
          type="button"
          variant="secondary"
          size="l"
          disabled={isBusy}
          onClick={onClose}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="l"
          disabled={isBusy || duplicateStatus === "taken"}
          className="flex-1 gap-1.5"
        >
          {isBusy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>저장 중...</span>
            </>
          ) : (
            "저장하기"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─────────────────────────────────────────────
// 외부 노출 모달 래퍼
// ─────────────────────────────────────────────
export function EditProfileModal({
  isOpen,
  onClose,
  currentProfile,
  currentUserId,
  onSave,
  isLoading = false,
}: EditProfileModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isLoading && onClose()}
    >
      <DialogContent
        showCloseButton={!isLoading}
        className="max-w-[420px] w-full text-left max-h-[90vh] overflow-y-auto p-5 sm:p-6"
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-[20px] font-bold text-[#191F28] flex items-center gap-1.5">
            <UserCircle2 className="w-5 h-5 text-[#3182F6]" />
            프로필 수정
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#6B7684]">
            표시 이름, 소개글, 상태 메시지를 수정할 수 있어요
          </DialogDescription>
        </DialogHeader>

        {isOpen && (
          <EditProfileForm
            key={`edit-profile-${currentProfile.name}`}
            currentProfile={currentProfile}
            currentUserId={currentUserId}
            onClose={onClose}
            onSave={onSave}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

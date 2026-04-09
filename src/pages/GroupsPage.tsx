/**
 * GroupsPage — Responsive implementation with full API integration
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useIsMobile';
import { useGroups, useGroupDetails, useGroupStats, useGroupMemberStatus, useWeekData } from '../hooks/useForestData';
import { groupApi } from '../api';
import { getCurrentWeekId } from '../utils';
import { useAuthStore } from '../stores/authStore';

// ─── Design tokens ──────────────────────────────────────────────────────────
const BG         = '#F2F2F2';
const WHITE      = '#FFFFFF';
const SUPERWHITE = '#FAFAFA';
const GREEN      = '#006D37';
const DARK       = '#1A1A1A';
const SHADOW     = `4px 4px 0px 0px ${DARK}`;
const BORDER2    = `2px solid ${DARK}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FOCUS_BG     = 'rgba(187,233,194,0.5)';
const FOCUS_BORDER = `1px solid ${GREEN}`;
const AFK_BG       = '#EEEEEE';
const AFK_BORDER   = '1px solid rgba(26,28,28,0.1)';
const AFK_DOT      = 'rgba(26,28,28,0.2)';
const AFK_TEXT     = 'rgba(26,28,28,0.4)';

function StatusBadge({ status, isMobile }: { status: 'focus' | 'afk'; isMobile: boolean }) {
  const isFocus = status === 'focus';
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isMobile ? '4px' : '6px',
      padding: isMobile ? '3px 8px' : '4px 12px',
      background: isFocus ? FOCUS_BG : AFK_BG,
      border: isFocus ? FOCUS_BORDER : AFK_BORDER,
      borderRadius: '9999px',
    }}>
      <span style={{
        width: isMobile ? '4px' : '6px',
        height: isMobile ? '4px' : '6px',
        borderRadius: '50%',
        background: isFocus ? GREEN : AFK_DOT,
        flexShrink: 0,
        display: 'inline-block',
      }} />
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 900,
        fontSize: isMobile ? '8px' : '10px',
        textTransform: 'uppercase',
        letterSpacing: '-0.05em',
        color: isFocus ? GREEN : AFK_TEXT,
      }}>
        {isFocus ? 'Focus' : 'AFK'}
      </span>
    </div>
  );
}

function Avatar({ size = 48 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '9999px',
      border: `1px solid ${DARK}`,
      background: SUPERWHITE,
      flexShrink: 0,
    }} />
  );
}

// ─── Left panel ───────────────────────────────────────────────────────────────
function LeftPanel({ selectedId, onSelect, isMobile }: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  isMobile: boolean;
}) {
  const queryClient = useQueryClient();
  const { data: groupsData } = useGroups();
  const groups = groupsData?.groups || [];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: groupApi.create,
    onSuccess: (data) => {
      setInviteCode(data.inviteCode);
      setNewGroupName('');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created! Share the invite code.');
    },
  });

  const joinMutation = useMutation({
    mutationFn: groupApi.join,
    onSuccess: (data) => {
      // Show toast
      toast.success(`Joined ${data.name}!`);
      
      // Invalidate and select new group
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setShowJoinModal(false);
      setJoinCode('');
      setJoinError(null);
      
      // Select the newly joined group
      onSelect(data.id);
    },
    onError: (error: any) => {
      const code = error?.response?.data?.error?.code;
      if (code === 'INVALID_INVITE_CODE') {
        setJoinError('Invalid invite code. Check with your group admin.');
      } else if (code === 'ALREADY_MEMBER') {
        setJoinError("You're already in this group.");
      } else if (code === 'GROUP_FULL') {
        setJoinError('This group is full (5 members max).');
      } else {
        setJoinError('Failed to join group. Please try again.');
      }
    },
  });

  const handleCreate = () => {
    if (newGroupName.trim()) {
      createMutation.mutate(newGroupName.trim());
    }
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length === 6) {
      setJoinError(null);
      joinMutation.mutate(code);
    } else {
      setJoinError('Invite code must be 6 characters.');
    }
  };

  return (
    <>
      <div style={{
        width: isMobile ? '100%' : '549px',
        flexShrink: 0,
        background: SUPERWHITE,
        border: BORDER2,
        boxShadow: SHADOW,
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        overflow: 'hidden',
        alignSelf: 'flex-start',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '24px 20px 16px' : '36px 36px 24px',
        }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? '20px' : '24px',
            color: DARK,
            letterSpacing: '-0.01em',
          }}>
            Your Groups
          </span>
          <svg width={isMobile ? '24' : '30'} height={isMobile ? '24' : '30'} viewBox="0 0 30 30" fill="none">
            <path d="M20 26V23.5C20 22.1739 19.4732 20.9022 18.5355 19.9645C17.5978 19.0268 16.3261 18.5 15 18.5H7.5C6.17392 18.5 4.90215 19.0268 3.96447 19.9645C3.02678 20.9022 2.5 22.1739 2.5 23.5V26" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.25 13.5C13.7353 13.5 15.75 11.4853 15.75 9C15.75 6.51472 13.7353 4.5 11.25 4.5C8.76472 4.5 6.75 6.51472 6.75 9C6.75 11.4853 8.76472 13.5 11.25 13.5Z" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M27.5 26V23.5C27.4992 22.3783 27.1122 21.2893 26.4018 20.4084C25.6913 19.5274 24.7 18.9076 23.5938 18.6562" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.0938 4.65625C21.2028 4.90608 22.197 5.52638 22.9093 6.40888C23.6216 7.29138 24.009 8.38244 24.009 9.50781C24.009 10.6332 23.6216 11.7242 22.9093 12.6067C22.197 13.4892 21.2028 14.1095 20.0938 14.3594" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Group cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '12px' : '16px',
          padding: isMobile ? '0 20px' : '0 36px',
        }}>
          {groups.length === 0 ? (
            <div style={{
              padding: isMobile ? '32px 16px' : '48px 24px',
              textAlign: 'center',
              color: '#666',
              fontFamily: "'Inter', sans-serif",
              fontSize: isMobile ? '14px' : '16px',
            }}>
              No groups yet. Create one or join with a code!
            </div>
          ) : (
            groups.map((group, i) => {
              const isSelected = group.id === selectedId;
              const activeCount = group.activeMemberCount || 0;

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => onSelect(group.id)}
                  style={{
                    background: isSelected ? GREEN : SUPERWHITE,
                    border: `1.52px solid ${DARK}`,
                    boxShadow: SHADOW,
                    borderRadius: '4px',
                    padding: isMobile ? '16px' : '20px 24px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0px',
                    transition: 'transform 0.12s',
                  }}
                >
                  {/* Row: name + badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: isMobile ? '16px' : '22px',
                      color: isSelected ? SUPERWHITE : DARK,
                      letterSpacing: '-0.01em',
                    }}>
                      {group.name}
                    </span>

                    <div style={{
                      background: isSelected ? SUPERWHITE : GREEN,
                      borderRadius: '4px',
                      padding: isMobile ? '3px 8px' : '4px 12px',
                    }}>
                      <span style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: isMobile ? '10px' : '12px',
                        color: isSelected ? DARK : SUPERWHITE,
                        letterSpacing: '0.02em',
                      }}>
                        {activeCount} Active
                      </span>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div style={{ marginTop: isMobile ? '12px' : '18px', opacity: 0.8 }}>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: isMobile ? '12px' : '14px',
                      color: isSelected ? SUPERWHITE : DARK,
                    }}>
                      {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* CREATE GROUP + JOIN GROUP buttons */}
        <div style={{ 
          padding: isMobile ? '16px 20px 24px' : '24px 36px 36px',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '12px' : '16px',
        }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              width: '100%',
              height: isMobile ? '56px' : '80px',
              border: `1.52px dashed ${DARK}`,
              borderRadius: '4px',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '8px' : '12px',
              cursor: 'pointer',
              opacity: 0.6,
              transition: 'opacity 0.18s',
            }}
          >
            <svg width={isMobile ? '16' : '21'} height={isMobile ? '16' : '21'} viewBox="0 0 21 21" fill="none">
              <circle cx="10.5" cy="10.5" r="9.5" stroke={DARK} strokeWidth="1.52"/>
              <path d="M10.5 5.5V15.5M5.5 10.5H15.5" stroke={DARK} strokeWidth="1.52" strokeLinecap="round"/>
            </svg>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? '12px' : '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: DARK,
            }}>
              Create Group
            </span>
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            style={{
              width: '100%',
              height: isMobile ? '56px' : '80px',
              border: `1.52px solid ${DARK}`,
              borderRadius: '4px',
              background: GREEN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '8px' : '12px',
              cursor: 'pointer',
              transition: 'transform 0.18s',
            }}
          >
            <svg width={isMobile ? '16' : '20'} height={isMobile ? '16' : '20'} viewBox="0 0 20 20" fill="none">
              <path d="M14 7V5C14 3.89543 13.1046 3 12 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17H12C13.1046 17 14 16.1046 14 15V13" stroke={SUPERWHITE} strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7 10H17M17 10L14 7M17 10L14 13" stroke={SUPERWHITE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? '12px' : '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: SUPERWHITE,
            }}>
              Join Group
            </span>
          </button>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26,26,26,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: SUPERWHITE,
            border: BORDER2,
            boxShadow: SHADOW,
            borderRadius: '8px',
            padding: isMobile ? '24px' : '32px',
            maxWidth: '400px',
            width: '100%',
          }}>
            {inviteCode ? (
              <>
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: 700,
                  color: DARK,
                  marginBottom: '16px',
                }}>
                  Group Created!
                </h3>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '16px',
                }}>
                  Share this invite code with your friends:
                </p>
                <div style={{
                  background: WHITE,
                  border: `1px solid ${DARK}`,
                  borderRadius: '4px',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '24px',
                }}>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '32px',
                    fontWeight: 700,
                    color: GREEN,
                    letterSpacing: '0.1em',
                  }}>
                    {inviteCode}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setInviteCode(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: GREEN,
                    color: SUPERWHITE,
                    border: 'none',
                    borderRadius: '4px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: 700,
                  color: DARK,
                  marginBottom: '16px',
                }}>
                  Create New Group
                </h3>
                <input
                  type="text"
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${DARK}`,
                    borderRadius: '4px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '16px',
                    marginBottom: '16px',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewGroupName('');
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: WHITE,
                      color: DARK,
                      border: `1px solid ${DARK}`,
                      borderRadius: '4px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newGroupName.trim() || createMutation.isPending}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: GREEN,
                      color: SUPERWHITE,
                      border: 'none',
                      borderRadius: '4px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: newGroupName.trim() ? 'pointer' : 'not-allowed',
                      opacity: newGroupName.trim() ? 1 : 0.5,
                    }}
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26,26,26,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: SUPERWHITE,
            border: BORDER2,
            boxShadow: SHADOW,
            borderRadius: '8px',
            padding: isMobile ? '24px' : '32px',
            maxWidth: '400px',
            width: '100%',
          }}>
            <h3 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: DARK,
              marginBottom: '16px',
            }}>
              Join Group
            </h3>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#666',
              marginBottom: '16px',
            }}>
              Enter the 6-digit invite code:
            </p>
            <input
              type="text"
              placeholder="ABC123"
              value={joinCode}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().slice(0, 6);
                setJoinCode(val);
                setJoinError(null);
              }}
              maxLength={6}
              style={{
                width: '100%',
                padding: '16px',
                border: `2px solid ${joinError ? '#DC2626' : DARK}`,
                borderRadius: '4px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '24px',
                fontWeight: 700,
                textAlign: 'center',
                letterSpacing: '0.2em',
                marginBottom: '8px',
                boxSizing: 'border-box',
                textTransform: 'uppercase',
              }}
            />
            {joinError && (
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                color: '#DC2626',
                marginBottom: '16px',
                marginTop: '0',
              }}>
                {joinError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                  setJoinError(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: WHITE,
                  color: DARK,
                  border: `1px solid ${DARK}`,
                  borderRadius: '4px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={joinCode.length !== 6 || joinMutation.isPending}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: GREEN,
                  color: SUPERWHITE,
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: joinCode.length === 6 ? 'pointer' : 'not-allowed',
                  opacity: joinCode.length === 6 ? 1 : 0.5,
                }}
              >
                {joinMutation.isPending ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Members table ────────────────────────────────────────────────────────────
function MembersTable({ groupId, isMobile, onLeaveGroup }: { 
  groupId: string | null; 
  isMobile: boolean;
  onLeaveGroup: () => void;
}) {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const { data: groupDetails } = useGroupDetails(groupId);
  const { data: memberStatusData } = useGroupMemberStatus(groupId);
  const members = memberStatusData?.members || [];
  const isAdmin = groupDetails?.adminUserId === user?.id;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: groupApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onLeaveGroup();
    },
  });

  const leaveMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) => 
      groupApi.removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onLeaveGroup();
    },
  });

  const handleDelete = () => {
    if (!groupId || !isAdmin) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      // Reset after 3s if user doesn't confirm
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setConfirmDelete(false);
    deleteMutation.mutate(groupId);
  };

  const handleLeave = () => {
    if (!groupId || !user?.id) return;
    if (!confirmLeave) {
      setConfirmLeave(true);
      setTimeout(() => setConfirmLeave(false), 3000);
      return;
    }
    setConfirmLeave(false);
    leaveMutation.mutate({ groupId, userId: user.id });
  };

  if (!groupId) {
    return (
      <div style={{
        background: WHITE,
        border: BORDER2,
        boxShadow: SHADOW,
        borderRadius: '4px',
        padding: isMobile ? '32px 16px' : '64px 32px',
        textAlign: 'center',
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: isMobile ? '14px' : '16px',
          color: '#666',
        }}>
          Select a group to view members
        </span>
      </div>
    );
  }

  return (
    <div style={{
      background: WHITE,
      border: BORDER2,
      boxShadow: SHADOW,
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      padding: isMobile ? '16px' : '32px',
      gap: isMobile ? '16px' : '32px',
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? '18px' : '24px',
          textTransform: 'uppercase',
          letterSpacing: '-0.05em',
          color: DARK,
        }}>
          Members
        </span>
        {isAdmin ? (
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? '10px' : '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: confirmDelete ? '#FAFAFA' : DARK,
              background: confirmDelete ? '#DC2626' : SUPERWHITE,
              border: `1px solid ${confirmDelete ? '#DC2626' : DARK}`,
              borderRadius: '2px',
              padding: isMobile ? '6px 12px' : '8px 16px',
              cursor: deleteMutation.isPending ? 'wait' : 'pointer',
              opacity: deleteMutation.isPending ? 0.5 : 1,
              transition: 'background 0.2s, color 0.2s, border-color 0.2s',
            }}
          >
            {deleteMutation.isPending ? 'Deleting...' : confirmDelete ? 'Tap again to confirm' : 'Delete Group'}
          </button>
        ) : (
          <button
            onClick={handleLeave}
            disabled={leaveMutation.isPending}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? '10px' : '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: confirmLeave ? '#FAFAFA' : '#DC2626',
              background: confirmLeave ? '#DC2626' : SUPERWHITE,
              border: `1px solid #DC2626`,
              borderRadius: '2px',
              padding: isMobile ? '6px 12px' : '8px 16px',
              cursor: leaveMutation.isPending ? 'wait' : 'pointer',
              opacity: leaveMutation.isPending ? 0.5 : 1,
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {leaveMutation.isPending ? 'Leaving...' : confirmLeave ? 'Tap again to confirm' : 'Leave Group'}
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflowX: 'auto' }}>
        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 80px 60px' : '1fr 1fr 1fr 0.7fr',
          padding: isMobile ? '0 8px' : '0 10px',
          height: isMobile ? '36px' : '46px',
          alignItems: 'center',
          borderBottom: `1px solid rgba(26,28,28,0.1)`,
          minWidth: isMobile ? '280px' : 'auto',
        }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: isMobile ? '8px' : '10px',
            textTransform: 'uppercase', letterSpacing: '10%',
            color: DARK, textAlign: 'left',
          }}>Member</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: isMobile ? '8px' : '10px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: DARK, textAlign: 'center',
          }}>Status</span>
          {!isMobile && (
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: '10px',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: DARK, textAlign: 'center',
            }}>Streak</span>
          )}
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: isMobile ? '8px' : '10px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: DARK, textAlign: 'right',
          }}>Contrib</span>
        </div>

        {/* Data rows */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: isMobile ? '0 8px' : '0 10px',
        }}>
          {members.length === 0 ? (
            <div style={{
              padding: isMobile ? '24px 8px' : '32px 10px',
              textAlign: 'center',
              color: '#666',
              fontFamily: "'Inter', sans-serif",
              fontSize: isMobile ? '14px' : '16px',
            }}>
              No members yet
            </div>
          ) : (
            members.map((member, i) => (
              <motion.div
                key={member.userId}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.08 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 80px 60px' : '1fr 1fr 1fr 0.7fr',
                  alignItems: 'center',
                  borderBottom: i < members.length - 1 ? `1px solid rgba(26,28,28,0.1)` : 'none',
                  padding: '0',
                  minWidth: isMobile ? '280px' : 'auto',
                }}
              >
                {/* Member cell */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px',
                  padding: isMobile ? '12px 1px' : '24px 1px',
                }}>
                  <Avatar size={isMobile ? 32 : 48} />
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: isMobile ? '12px' : '16px',
                    color: DARK,
                  }}>
                    {member.name}
                  </span>
                </div>

                {/* Status cell */}
                <div style={{
                  display: 'flex', justifyContent: 'center',
                  padding: isMobile ? '12px 1px' : '37.5px 1px',
                }}>
                  <StatusBadge status={member.status === 'focus_session' ? 'focus' : 'afk'} isMobile={isMobile} />
                </div>

                {/* Streak cell (desktop only) */}
                {!isMobile && (
                  <div style={{
                    display: 'flex', justifyContent: 'center',
                    padding: '34.5px 1px',
                  }}>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700, fontSize: '20px',
                      color: DARK, textAlign: 'center',
                    }}>
                      {member.personalStreak} Days
                    </span>
                  </div>
                )}

                {/* Contribution cell */}
                <div style={{
                  display: 'flex', justifyContent: 'flex-end',
                  padding: isMobile ? '12px 1px' : '32px 1px 33px',
                }}>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 900, fontSize: isMobile ? '16px' : '24px',
                    color: DARK, textAlign: 'right',
                  }}>
                    {member.contribution}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stats 2×2 grid ───────────────────────────────────────────────────────────
function StatsGrid({ groupId, isMobile }: { groupId: string | null; isMobile: boolean }) {
  const { data: stats } = useGroupStats(groupId);

  if (!groupId) {
    return (
      <div style={{
        background: SUPERWHITE,
        border: BORDER2,
        boxShadow: SHADOW,
        borderRadius: '4px',
        padding: isMobile ? '32px 16px' : '64px 32px',
        textAlign: 'center',
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: isMobile ? '14px' : '16px',
          color: '#666',
        }}>
          Select a group to view stats
        </span>
      </div>
    );
  }

  const cards = [
    { label: 'Total Minutes', value: stats?.totalMinutes ?? '--', green: false },
    { label: 'Trees Completed', value: stats?.treesCompleted ?? '--', green: true },
    { label: 'Sessions', value: stats?.sessions ?? '--', green: false },
    { label: 'Today Trees', value: stats?.todayTreeCount ?? '--', green: false },
  ];

  return (
    <div style={{
      background: SUPERWHITE,
      border: BORDER2,
      boxShadow: SHADOW,
      borderRadius: '4px',
      padding: isMobile ? '16px' : '48px 56px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: isMobile ? '12px' : '18px',
      }}>
        {cards.map(card => (
          <StatCard key={card.label} card={card} isMobile={isMobile} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ card, isMobile }: { card: { label: string; value: number | string; green: boolean }; isMobile: boolean }) {
  return (
    <div style={{
      background: card.green ? GREEN : WHITE,
      border: BORDER2,
      boxShadow: `4px 4px 0px 0px ${DARK}`,
      padding: isMobile ? '16px' : '32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: isMobile ? '8px' : '16px',
      height: isMobile ? '100px' : '190px',
      boxSizing: 'border-box',
      justifyContent: 'space-between',
    }}>
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? '9px' : '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: card.green ? SUPERWHITE : '#3D4A3E',
        display: 'block',
        textAlign: 'center',
      }}>
        {card.label}
      </span>
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? '28px' : '60px',
        lineHeight: '1em',
        color: card.green ? SUPERWHITE : '#1A1C1C',
        display: 'block',
        textAlign: 'center',
        letterSpacing: '-0.02em',
      }}>
        {card.value}
      </span>
    </div>
  );
}

// ─── Weekly calendar ──────────────────────────────────────────────────────────
function WeeklySection({ groupId, isMobile }: { groupId: string | null; isMobile: boolean }) {
  const weekId = getCurrentWeekId();
  const { data: weekData } = useWeekData(weekId);
  const days = weekData?.days || [];

  const today = new Date();
  const dayOfWeek = today.getDay();
  const adjustedToday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - adjustedToday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  const rangeLabel = `${fmtDate(monday)} - ${fmtDate(sunday)}`;

  const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const dayStates = WEEK_DAYS.map((_, i) => {
    const dayData = days[i];
    return {
      isPast: i < adjustedToday,
      isToday: i === adjustedToday,
      isFuture: i > adjustedToday,
      hasTree: dayData && dayData.stage > 0,
      stage: dayData?.stage || 0,
    };
  });

  if (!groupId) {
    return (
      <div style={{
        background: SUPERWHITE,
        border: BORDER2,
        boxShadow: SHADOW,
        borderRadius: '4px',
        padding: isMobile ? '32px 16px' : '64px 32px',
        textAlign: 'center',
      }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: isMobile ? '14px' : '16px',
          color: '#666',
        }}>
          Select a group to view this week's progress
        </span>
      </div>
    );
  }

  return (
    <div style={{
      background: SUPERWHITE,
      border: BORDER2,
      boxShadow: SHADOW,
      borderRadius: '4px',
      padding: isMobile ? '16px' : '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '16px' : '32px',
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900,
          fontSize: isMobile ? '18px' : '30px',
          textTransform: 'uppercase',
          color: DARK,
          lineHeight: '1.2em',
        }}>
          This Week
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: isMobile ? '12px' : '16px',
          color: DARK,
          letterSpacing: '0.04em',
        }}>
          {rangeLabel}
        </span>
      </div>

      {/* 7 day columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: isMobile ? '4px' : '12px',
      }}>
        {WEEK_DAYS.map((day, i) => {
          const { isPast, isToday, isFuture, hasTree } = dayStates[i];

          return (
            <div
              key={day}
              style={{
                border: `2px ${isFuture ? 'dashed' : 'solid'} ${DARK}`,
                borderRadius: '4px',
                background: isToday ? GREEN : SUPERWHITE,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: isMobile ? '4px' : '8px',
                padding: isMobile ? '8px 4px' : '16px',
                minHeight: isMobile ? '80px' : '140px',
                opacity: isFuture ? 0.4 : 1,
                boxSizing: 'border-box',
              }}
            >
              {/* Day label */}
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? '8px' : '12px',
                textTransform: 'uppercase',
                color: isToday ? 'rgba(250,250,250,0.9)' : DARK,
                opacity: isToday ? 1 : 0.6,
                letterSpacing: '0.02em',
              }}>
                {day}
              </span>

              {/* Tree SVG icon */}
              {!isFuture && hasTree && (
                <svg
                  width={isMobile ? '16' : '30'}
                  height={isMobile ? '20' : '35'}
                  viewBox="0 0 30 35"
                  fill="none"
                >
                  <polygon
                    points="15,2 28,26 2,26"
                    fill={isToday ? SUPERWHITE : GREEN}
                    stroke={isToday ? 'rgba(250,250,250,0.5)' : DARK}
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="15,10 24,28 6,28"
                    fill={isToday ? 'rgba(250,250,250,0.85)' : `${GREEN}cc`}
                  />
                  <rect
                    x="12.5" y="26" width="5" height="7"
                    rx="1"
                    fill={isToday ? 'rgba(250,250,250,0.7)' : '#7B4F2E'}
                    stroke={isToday ? 'rgba(250,250,250,0.4)' : DARK}
                    strokeWidth="1"
                  />
                </svg>
              )}

              {/* Check icon */}
              {!isFuture && (
                <svg width={isMobile ? '12' : '20'} height={isMobile ? '12' : '20'} viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10" cy="10" r="9"
                    stroke={isToday ? 'rgba(250,250,250,0.55)' : 'rgba(26,26,26,0.25)'}
                    strokeWidth="1.5"
                  />
                  {(isPast || isToday) && hasTree && (
                    <path
                      d="M6 10L8.8 13L14 7"
                      stroke={isToday ? 'rgba(250,250,250,0.9)' : 'rgba(26,26,26,0.55)'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GroupsPage() {
  const { data: groupsData } = useGroups();
  const groups = groupsData?.groups || [];
  const [selectedId, setSelected] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Auto-select first group when groups load
  React.useEffect(() => {
    if (groups.length > 0 && !selectedId) {
      setSelected(groups[0].id);
    }
  }, [groups, selectedId]);

  // Handle leave/delete group - deselect current group
  const handleLeaveGroup = () => {
    setSelected(null);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      {!isMobile && <Sidebar activePage="groups" />}

      {/* Main content */}
      <div style={{
        marginLeft: isMobile ? 0 : '101px',
        flex: 1,
        padding: isMobile ? '20px 16px 100px' : '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '16px' : '24px',
        boxSizing: 'border-box',
      }}>

        {/* Mobile Header */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: '8px',
          }}>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '20px',
              color: DARK,
              margin: 0,
            }}>
              Groups
            </h1>
          </div>
        )}

        {/* Top area: Left panel + Right panels */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '24px',
          alignItems: 'flex-start',
        }}>

          {/* Left: Your Groups */}
          <LeftPanel
            selectedId={selectedId}
            onSelect={setSelected}
            isMobile={isMobile}
          />

          {/* Right column: Members + Stats stacked */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '24px',
            width: isMobile ? '100%' : 'auto',
          }}>
            <MembersTable groupId={selectedId} isMobile={isMobile} onLeaveGroup={handleLeaveGroup} />
            <StatsGrid groupId={selectedId} isMobile={isMobile} />
          </div>
        </div>

        {/* Bottom: THIS WEEK calendar (full width) */}
        <WeeklySection groupId={selectedId} isMobile={isMobile} />

        {/* Bottom spacer */}
        <div style={{ height: '24px' }} />
      </div>

      {isMobile && <MobileBottomNav activePage="groups" />}
    </div>
  );
}

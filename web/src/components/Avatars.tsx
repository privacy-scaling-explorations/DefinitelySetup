import React, { useState, useEffect, useRef } from "react";
import { Avatar, Box } from "@chakra-ui/react";
import { useProjectPageContext } from "../context/ProjectPageContext";

/**
 * Hook to observe when a specific avatar is in the viewport
 */
const useIntersectionObserver = (setInView: (inView: boolean) => void) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = (element: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    });

    if (element) {
      observerRef.current.observe(element);
    }
  };

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return observe;
};

/**
 * Display the participants' Avatars in a scrolling list with lazy loading.
 */
const ScrollingAvatars: React.FC = () => {
  const { avatars } = useProjectPageContext();
  const [loadedAvatars, setLoadedAvatars] = useState<{ [key: number]: boolean }>({});

  const handleAvatarInView = (index: number, inView: boolean) => {
    if (inView) {
      setLoadedAvatars((prev) => ({ ...prev, [index]: true }));
    }
  };

  return (
    <Box
      maxW={"container.md"}
      width="50%"
      overflowX="auto"
      whiteSpace="nowrap"
      py={4}
      px={2}
      borderColor="gray.200"
    >
      {avatars &&
        avatars.length > 0 &&
        avatars.map((image: string, index: number) => (
          <LazyAvatar
            key={index}
            src={image}
            index={index}
            isLoaded={loadedAvatars[index]}
            onInViewChange={(inView) => handleAvatarInView(index, inView)}
          />
        ))}
    </Box>
  );
};

/**
 * Lazy loading Avatar component
 */
const LazyAvatar: React.FC<{
  src: string;
  index: number;
  isLoaded: boolean;
  onInViewChange: (inView: boolean) => void;
}> = ({ src, index, isLoaded, onInViewChange }) => {
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const observe = useIntersectionObserver((inView) => onInViewChange(inView));

  useEffect(() => {
    if (avatarRef.current) {
      observe(avatarRef.current);
    }
  }, [avatarRef, observe]);

  return (
    <Box ref={avatarRef} display="inline-block">
      {isLoaded ? <Avatar src={src} mx={2} /> : <Avatar mx={2} />}
    </Box>
  );
};

export default ScrollingAvatars;


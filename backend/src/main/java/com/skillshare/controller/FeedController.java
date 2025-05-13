package com.skillshare.controller;

import com.skillshare.model.Feed;
import com.skillshare.model.User;
import com.skillshare.service.FeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feeds")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    @PostMapping
    public ResponseEntity<?> createFeed(@RequestBody Feed feed, @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(feedService.createFeed(feed, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getFeeds(@AuthenticationPrincipal User user, Pageable pageable) {
        Page<Feed> feeds = feedService.getFeeds(user, pageable);
        return ResponseEntity.ok(feeds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFeedById(@PathVariable String id, @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(feedService.getFeedById(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFeed(@PathVariable String id, @RequestBody Feed updatedFeed, @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(feedService.updateFeed(id, updatedFeed, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeed(@PathVariable String id, @AuthenticationPrincipal User user) {
        try {
            feedService.deleteFeed(id, user);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/posts/{postId}")
    public ResponseEntity<?> addPostToFeed(@PathVariable String id, @PathVariable String postId, @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(feedService.addPostToFeed(id, postId, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/posts/{postId}")
    public ResponseEntity<?> removePostFromFeed(@PathVariable String id, @PathVariable String postId, @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(feedService.removePostFromFeed(id, postId, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 
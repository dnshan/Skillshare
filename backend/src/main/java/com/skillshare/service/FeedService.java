package com.skillshare.service;

import com.skillshare.model.Feed;
import com.skillshare.model.Post;
import com.skillshare.model.User;
import com.skillshare.repository.mongo.FeedRepository;
import com.skillshare.repository.mongo.PostRepository;
import com.skillshare.repository.mongo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final FeedRepository feedRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public Feed createFeed(Feed feed, User user) {
        if (feedRepository.existsByNameAndUser(feed.getName(), user)) {
            throw new RuntimeException("Feed with this name already exists");
        }
        feed.setUser(user);
        feed.onCreate();
        return feedRepository.save(feed);
    }

    public Page<Feed> getFeeds(User user, Pageable pageable) {
        return feedRepository.findByUser(user, pageable);
    }

    public Feed getFeedById(String id, User user) {
        Feed feed = feedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feed not found"));
        if (!feed.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to view this feed");
        }
        return feed;
    }

    public Feed updateFeed(String id, Feed updatedFeed, User user) {
        Feed feed = feedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feed not found"));
        if (!feed.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to update this feed");
        }
        if (!feed.getName().equals(updatedFeed.getName()) && 
            feedRepository.existsByNameAndUser(updatedFeed.getName(), user)) {
            throw new RuntimeException("Feed with this name already exists");
        }
        feed.setName(updatedFeed.getName());
        feed.setDescription(updatedFeed.getDescription());
        feed.onUpdate();
        return feedRepository.save(feed);
    }

    public void deleteFeed(String id, User user) {
        Feed feed = feedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feed not found"));
        if (!feed.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this feed");
        }
        feedRepository.delete(feed);
    }

    public Feed addPostToFeed(String id, String postId, User user) {
        Feed feed = feedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feed not found"));
        if (!feed.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to modify this feed");
        }
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        feed.getPosts().add(post);
        feed.onUpdate();
        return feedRepository.save(feed);
    }

    public Feed removePostFromFeed(String id, String postId, User user) {
        Feed feed = feedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feed not found"));
        if (!feed.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to modify this feed");
        }
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        feed.getPosts().remove(post);
        feed.onUpdate();
        return feedRepository.save(feed);
    }
} 
// backend/src/main/java/com/interviewcopilot/service/CustomOAuth2UserService.java
package com.interviewcopilot.service;

import com.interviewcopilot.entity.User;
import com.interviewcopilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub");
        String picture = oAuth2User.getAttribute("picture");

        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isEmpty()) {
            User newUser = User.builder()
                    .email(email)
                    .fullName(name)
                    .password("")
                    .role(User.Role.USER)
                    .provider(provider)
                    .providerId(providerId)
                    .profilePicture(picture)
                    .enabled(true)
                    .build();
            userRepository.save(newUser);
            log.info("New OAuth2 user created: {}", email);
        } else {
            User user = existingUser.get();
            user.setProfilePicture(picture);
            user.setFullName(name);
            userRepository.save(user);
            log.info("Existing OAuth2 user logged in: {}", email);
        }

        return oAuth2User;
    }
}